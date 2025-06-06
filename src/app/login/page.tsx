'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Define types for API response
  interface RegisterSuccessResponse {
    id: string;
    username: string;
  }

  interface ErrorResponse {
    error: string;
  }

  // Type guard to check if the response is an error
  function isErrorResponse(response: any): response is ErrorResponse {
    return typeof response === 'object' && response !== null && 'error' in response;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    let countryCode: string | undefined, phone: string | undefined, role: string | undefined;

    if (!isLogin) {
      countryCode = formData.get('countryCode') as string;
      phone = formData.get('phoneNumber') as string;
      role = formData.get('role') as string;
    }

    if (isLogin) {
      // Handle login
      try {
        const result = await signIn('credentials', {
          redirect: false,
          username,
          password,
        });

        if (result?.error) {
          setError('Invalid username or password. Please try again.');
        } else {
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      } catch (err) {
        setError('An error occurred during login. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Handle signup
      if (!username || !password || !confirmPassword || !role) { 
        setError('All fields except phone number are required.');
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setIsLoading(false);
        return;
      }

      let fullPhoneNumber: string | undefined = undefined;
      if (countryCode && phone) {
        const numericCountryCode = countryCode.replace(/\D/g, '');
        const numericPhone = phone.replace(/\D/g, '');
        if (numericCountryCode && numericPhone) {
          fullPhoneNumber = `+${numericCountryCode}${numericPhone}`;
        }
      }
      
      const roleInt = parseInt(role as string, 10);
      if (isNaN(roleInt)) {
        setError('Invalid role selected.');
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, phoneNumber: fullPhoneNumber, role: roleInt }),
        });
        const data: RegisterSuccessResponse | ErrorResponse = await res.json();
        if (!res.ok) {
          if (isErrorResponse(data)) {
            setError(data.error || 'Registration failed.');
          } else {
            setError('Registration failed with an unknown error structure.');
          }
        } else {
          setSuccess('Registration successful! You can now log in.');
          setIsLogin(true);
        }
      } catch (err) {
        setError('An error occurred during registration. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/5 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-border/40 shadow-lg p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <span className="text-primary font-bold text-2xl">Walnut</span>
            </Link>
            <h1 className="text-2xl font-bold mt-6 mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-muted-foreground">
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Fill out the form to get started with your learning journey'}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder={isLogin ? "Enter your password" : "Create a password"}
                required
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                {/* Phone Number Inputs */}
                <div className="flex space-x-2 mt-4">
                  <div className="w-1/4">
                    <label htmlFor="countryCode" className="block text-sm font-medium mb-1">
                      Ext.
                    </label>
                    <input
                      type="text"
                      id="countryCode"
                      name="countryCode"
                      className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="+1"
                    />
                  </div>
                  <div className="w-3/4">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="e.g., 5551234567"
                    />
                  </div>
                </div>

                {/* Role Dropdown */}
                <div className="mt-4">
                  <label htmlFor="role" className="block text-sm font-medium mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 bg-card text-foreground"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>Select your role</option>
                    <option value="1">Student</option>
                    <option value="2">Admin</option>
                    <option value="3">Educator</option>
                  </select>
                </div>
              </>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/50"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
              </div>
            )}

            <div className="mt-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-success/10 border border-success text-success px-4 py-2 rounded-lg mb-4 text-sm">
                  {success}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-70"
              >
                {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
