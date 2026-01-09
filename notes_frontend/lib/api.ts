import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, clearTokens } from './auth';
import type { 
  AuthResponse, 
  LoginData, 
  RegisterData, 
  Note, 
  CreateNoteData, 
  UpdateNoteData,
  NoteVersion 
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('❌ NEXT_PUBLIC_API_BASE_URL is not defined in environment variables');
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined in environment variables');
}

console.log('✅ API Base URL configured:', API_BASE_URL);

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add JWT token and log requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Mark request start time for performance tracking
    (config as any).metadata = { startTime: performance.now() };
    
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Calculate and log response time
    const startTime = (response.config as any).metadata?.startTime;
    if (startTime) {
      const duration = performance.now() - startTime;
      console.log(`✅ ${response.status} ${response.config.url} (${duration.toFixed(0)}ms)`);
    } else {
      console.log(`✅ ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    // Log detailed error information
    if (error.response) {
      // Server responded with error status
      console.error(`❌ ${error.response.status} ${error.config?.url}`);
      console.error('Response data:', error.response.data);
      
      if (error.response.status === 401) {
        console.warn('🔒 Unauthorized - clearing tokens and redirecting to login');
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ No response received from server');
      console.error('Request URL:', error.config?.url);
      console.error('Base URL:', error.config?.baseURL);
      console.error('Full URL:', `${error.config?.baseURL}${error.config?.url}`);
      console.error('Error message:', error.message);
      console.error('Possible causes:');
      console.error('  1. Backend server is not running');
      console.error('  2. Wrong API URL in .env.local');
      console.error('  3. CORS issue (check browser console)');
      console.error('  4. Network/firewall blocking request');
    } else {
      // Error in setting up request
      console.error('❌ Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register/', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login/', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout/');
  },
};

// Notes API
export const notesAPI = {
  list: async (): Promise<Note[]> => {
    const response = await api.get<Note[]>('/notes/');
    return response.data;
  },

  get: async (id: number): Promise<Note> => {
    const response = await api.get<Note>(`/notes/${id}/`);
    return response.data;
  },

  create: async (data: CreateNoteData): Promise<Note> => {
    const response = await api.post<Note>('/notes/', data);
    return response.data;
  },

  update: async (id: number, data: UpdateNoteData): Promise<Note> => {
    const response = await api.put<Note>(`/notes/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/notes/${id}/`);
  },
};

// Version API
export const versionsAPI = {
  list: async (noteId: number): Promise<NoteVersion[]> => {
    const response = await api.get<NoteVersion[]>(`/notes/${noteId}/versions/`);
    return response.data;
  },

  restore: async (noteId: number, versionId: number): Promise<Note> => {
    const response = await api.post<Note>(`/notes/${noteId}/versions/${versionId}/restore/`);
    return response.data;
  },
};
