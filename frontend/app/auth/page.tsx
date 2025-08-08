'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthLayout from '@/components/auth/auth-layout'
import LoginForm from '@/components/auth/login-form'
import SignupForm from '@/components/auth/signup-form'

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // --- THIS IS THE FIX: New state to handle the success message ---
  const [signupSuccess, setSignupSuccess] = useState(false);
  // --- END OF FIX ---
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
        throw new Error(errData.detail || 'Login failed');
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
    setSignupSuccess(false);
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

      // --- THIS IS THE FIX: Show success message instead of auto-login ---
      setSignupSuccess(true);
      // --- END OF FIX ---

    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- THIS IS THE FIX: New component to show the verification message ---
  if (signupSuccess) {
    return (
      <AuthLayout title="Check Your Email">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-700">
            A confirmation link has been sent to your email address.
          </p>
          <p className="mt-4">Please click the link to verify your account before logging in.</p>
          <button
            onClick={() => {
              setSignupSuccess(false);
              setIsLogin(true);
            }}
            className="w-full neo-button mt-6 py-4 px-6"
          >
            Back to Login
          </button>
        </div>
      </AuthLayout>
    );
  }
  // --- END OF FIX ---

  return (
    <AuthLayout title={isLogin ? 'Welcome Back!' : 'Welcome!'}>
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