'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api, authAPI, notesAPI } from '@/lib/api';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  url?: string;
  method?: string;
  statusCode?: number;
}

export default function APIDebugPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runTests = async () => {
    setResults([]);
    setIsRunning(true);

    // Test 1: Environment Variable
    addResult({
      name: 'Environment Variable',
      status: process.env.NEXT_PUBLIC_API_BASE_URL ? 'success' : 'error',
      message: process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT FOUND',
      url: process.env.NEXT_PUBLIC_API_BASE_URL,
    });

    // Test 2: Axios Base URL
    addResult({
      name: 'Axios Base URL',
      status: api.defaults.baseURL ? 'success' : 'error',
      message: api.defaults.baseURL || 'NOT SET',
      url: api.defaults.baseURL,
    });

    // Test 3: Backend Health
    try {
      await fetch('http://127.0.0.1:8000/api/');
      addResult({
        name: 'Backend Reachable',
        status: 'success',
        message: 'Backend is running',
        url: 'http://127.0.0.1:8000/api/',
      });
    } catch (error) {
      addResult({
        name: 'Backend Reachable',
        status: 'error',
        message: 'Backend is NOT running or unreachable',
        url: 'http://127.0.0.1:8000/api/',
      });
    }

    // Test 4: Registration Endpoint
    try {
      await api.post('/auth/register/', {
        username: 'debugtest',
        email: 'debug@test.com',
        password: 'test123',
        password2: 'test123',
      });
      addResult({
        name: 'Registration Endpoint',
        status: 'success',
        message: 'Endpoint reachable (or user already exists)',
        url: `${api.defaults.baseURL}/auth/register/`,
        method: 'POST',
      });
    } catch (error: any) {
      const statusCode = error.response?.status;
      const isReachable = statusCode === 400 || statusCode === 201;
      
      addResult({
        name: 'Registration Endpoint',
        status: isReachable ? 'success' : 'error',
        message: isReachable 
          ? `Endpoint works (HTTP ${statusCode})`
          : `Failed: ${error.message}`,
        url: `${api.defaults.baseURL}/auth/register/`,
        method: 'POST',
        statusCode,
      });
    }

    // Test 5: Login Endpoint
    try {
      await api.post('/auth/login/', {
        username: 'testuser',
        password: 'wrongpass',
      });
      addResult({
        name: 'Login Endpoint',
        status: 'success',
        message: 'Endpoint reachable',
        url: `${api.defaults.baseURL}/auth/login/`,
        method: 'POST',
      });
    } catch (error: any) {
      const statusCode = error.response?.status;
      const isReachable = statusCode === 400 || statusCode === 401 || statusCode === 200;
      
      addResult({
        name: 'Login Endpoint',
        status: isReachable ? 'success' : 'error',
        message: isReachable 
          ? `Endpoint works (HTTP ${statusCode})`
          : `Failed: ${error.message}`,
        url: `${api.defaults.baseURL}/auth/login/`,
        method: 'POST',
        statusCode,
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔧 API Debug Tool</CardTitle>
            <CardDescription>
              Test your API configuration and connectivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runTests} disabled={isRunning}>
              {isRunning ? 'Running Tests...' : 'Run Diagnostic Tests'}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold">{result.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                      {result.url && (
                        <div className="mt-2 text-xs bg-gray-100 p-2 rounded font-mono">
                          {result.method && <span className="font-bold">{result.method} </span>}
                          {result.url}
                        </div>
                      )}
                      {result.statusCode && (
                        <p className="text-xs text-gray-500 mt-1">
                          HTTP Status: {result.statusCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Expected Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Environment Variable:</h4>
              <code className="block bg-gray-100 p-3 rounded text-sm">
                NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
              </code>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Expected Endpoint URLs:</h4>
              <ul className="space-y-1 text-sm">
                <li className="bg-gray-100 p-2 rounded font-mono">
                  POST http://127.0.0.1:8000/api/auth/register/
                </li>
                <li className="bg-gray-100 p-2 rounded font-mono">
                  POST http://127.0.0.1:8000/api/auth/login/
                </li>
                <li className="bg-gray-100 p-2 rounded font-mono">
                  GET http://127.0.0.1:8000/api/notes/
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Troubleshooting:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• If env variable is missing, restart Next.js: <code>npm run dev</code></li>
                <li>• If backend unreachable, start Django: <code>python manage.py runserver 127.0.0.1:8000</code></li>
                <li>• If CORS error, configure Django CORS for localhost:3000/3001</li>
                <li>• Open browser DevTools (F12) to see detailed network logs</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
