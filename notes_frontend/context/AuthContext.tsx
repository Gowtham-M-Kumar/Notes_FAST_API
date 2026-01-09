'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { setTokens, clearTokens, isAuthenticated as checkAuth } from '@/lib/auth';
import type { User, LoginData, RegisterData } from '@/lib/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated on mount
    const authenticated = checkAuth();
    console.log('🔐 Auth check on mount:', authenticated);
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  const login = async (data: LoginData) => {
    try {
      const startTime = performance.now();
      const response = await authAPI.login(data);
      const apiTime = performance.now() - startTime;
      console.log(`✅ Login API took ${apiTime.toFixed(0)}ms`);

      // Set tokens SYNCHRONOUSLY (no async)
      setTokens(response.access, response.refresh);
      setIsAuthenticated(true);
      if (response.user) {
        setUser(response.user);
      }

      // Show success message
      toast.success('Successfully logged in!');

      // CRITICAL: Use synchronous navigation for instant redirect
      // router.push() is async and can delay 100-300ms
      console.log('🚀 Instant redirect to dashboard');
      window.location.href = '/dashboard/notes';
    } catch (error: any) {
      // Check if it's a CORS error
      if (error.message === 'Network Error' && !error.response) {
        const errorMessage = '🚨 CORS Error: Backend needs CORS configuration. Check console for details.';
        toast.error(errorMessage, { duration: 8000 });
        throw error;
      }

      const errorMessage = error.response?.data?.detail ||
        error.response?.data?.message ||
        'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const startTime = performance.now();
      const response = await authAPI.register(data);
      const apiTime = performance.now() - startTime;
      console.log(`✅ Registration API took ${apiTime.toFixed(0)}ms`);

      // Set tokens SYNCHRONOUSLY (no async)
      setTokens(response.access, response.refresh);
      setIsAuthenticated(true);
      if (response.user) {
        setUser(response.user);
      }

      // Show success message
      toast.success('Registration successful!');

      // CRITICAL: Use synchronous navigation for instant redirect
      console.log('🚀 Instant redirect to dashboard');
      window.location.href = '/dashboard/notes';
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);

      let errorMessage = 'Registration failed. ';

      // Check if it's a CORS error
      if (error.message === 'Network Error' && !error.response) {
        errorMessage = '🚨 Connection or CORS Error: Backend needs to allow ' + window.location.origin + '\n\n' +
          'Fix in FastAPI app/core/config.py:\n' +
          '1. Locate BACKEND_CORS_ORIGINS\n' +
          '2. Add "' + window.location.origin + '" to the list\n' +
          '3. Restart FastAPI server\n\n' +
          'Also ensure the backend is running at: ' + process.env.NEXT_PUBLIC_API_BASE_URL;
        toast.error(errorMessage, { duration: 10000 });
        throw error;
      }

      // Check if it's a network error
      if (!error.response) {
        errorMessage = 'Cannot connect to server. Make sure the backend is running at: ' + process.env.NEXT_PUBLIC_API_BASE_URL;
        toast.error(errorMessage, { duration: 5000 });
        throw error;
      }

      // Get detailed error from backend
      const errorData = error.response?.data;
      if (typeof errorData === 'string') {
        errorMessage += errorData;
      } else if (errorData?.username) {
        errorMessage += 'Username: ' + (Array.isArray(errorData.username) ? errorData.username.join(', ') : errorData.username);
      } else if (errorData?.email) {
        errorMessage += 'Email: ' + (Array.isArray(errorData.email) ? errorData.email.join(', ') : errorData.email);
      } else if (errorData?.password) {
        errorMessage += 'Password: ' + (Array.isArray(errorData.password) ? errorData.password.join(', ') : errorData.password);
      } else if (errorData?.password2) {
        errorMessage += 'Confirm Password: ' + (Array.isArray(errorData.password2) ? errorData.password2.join(', ') : errorData.password2);
      } else if (errorData?.detail) {
        errorMessage += errorData.detail;
      } else {
        errorMessage += 'Please try again or check the console for details.';
      }

      toast.error(errorMessage, { duration: 5000 });
      throw error;
    }
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
