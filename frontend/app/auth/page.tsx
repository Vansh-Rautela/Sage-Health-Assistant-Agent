'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthLayout from '@/components/auth/auth-layout'
import LoginForm from '@/components/auth/login-form'
import SignupForm from '@/components/auth/signup-form'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Login failed. Please check your credentials.');
      }

      const data = await response.json();
      localStorage.setItem('hiaUser', JSON.stringify(data.user));
      localStorage.setItem('hiaToken', data.token);
      
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (name: string, email: string, password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Signup failed');
      }

      // With the backend fix, we can now reliably and immediately log the user in.
      await handleLogin(email, password);

    } catch (error: any) {
      setError(error.message);
      // Ensure loading stops if the signup itself fails before login is attempted
      setIsLoading(false); 
    }
  };

  return (
    <AuthLayout title={isLogin ? 'Welcome Back!' : 'Create Your Account'}>
      {isLogin ? (
        <LoginForm
          onToggleForm={() => setIsLogin(false)}
          onLogin={handleLogin}
          isLoading={isLoading}
        />
      ) : (
        <SignupForm
          onToggleForm={() => setIsLogin(true)}
          onSignup={handleSignup}
          isLoading={isLoading}
        />
      )}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </AuthLayout>
  );
}