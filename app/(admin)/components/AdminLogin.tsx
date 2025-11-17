'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '@/lib/auth';
import { useSpring, animated } from '@react-spring/web';
import { ThemeToggle } from '../../components/theme-toggle';

const AdminLoginSchema = z.object({
  username: z.string().min(3, 'Username is too short'),
  password: z.string().min(3, 'Password is too short'),
});

type AdminLoginFormData = z.infer<typeof AdminLoginSchema>;

const AdminLogin = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<AdminLoginFormData>({ resolver: zodResolver(AdminLoginSchema) });

  const usernameBorderAnimation = useSpring({
    borderColor: usernameFocused
      ? 'rgba(59, 130, 246, 1)'
      : 'rgba(209, 213, 219, 0.3)',
    config: { tension: 300, friction: 30 },
  });

  const passwordBorderAnimation = useSpring({
    borderColor: passwordFocused
      ? 'rgba(59, 130, 246, 1)'
      : 'rgba(209, 213, 219, 0.3)',
    config: { tension: 300, friction: 30 },
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Admin login failed');
      }

      if (result.data?.access && result.data?.refresh) {
        authService.setTokens(result.data.access, result.data.refresh);
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials.'
      );
      console.error('Admin login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-950 dark:to-neutral-900">
      {/* Theme Toggle positioned absolutely */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="squircle-2xl w-full max-w-md bg-white p-8 shadow-xl dark:bg-neutral-900">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Admin Portal
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Sign in to access the dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="squircle-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Username
            </label>
            <animated.input
              type="text"
              id="username"
              {...register('username')}
              onFocus={() => setUsernameFocused(true)}
              onBlur={() => setUsernameFocused(false)}
              style={{
                borderColor: usernameBorderAnimation.borderColor,
              }}
              className="squircle-xl h-12 w-full border-2 bg-white px-4 text-sm text-neutral-900 backdrop-blur-sm transition-shadow duration-200 placeholder:text-neutral-400 focus:shadow-lg focus:outline-none dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
              placeholder="Enter your username"
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                {...register('password')}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                style={{
                  borderColor: passwordBorderAnimation.borderColor as any,
                }}
                className="squircle-xl h-12 w-full border-2 bg-white px-4 pr-12 text-sm text-neutral-900 backdrop-blur-sm transition-shadow duration-200 placeholder:text-neutral-400 focus:shadow-lg focus:outline-none dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPassword(!showPassword);
                }}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="squircle-xl h-12 w-full bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
