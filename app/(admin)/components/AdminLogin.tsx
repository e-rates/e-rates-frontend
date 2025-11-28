'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, Heart, Check, HelpCircle } from 'lucide-react';
import { authService } from '@/lib/auth';
import { useSpring, animated } from '@react-spring/web';


const AdminLoginSchema = z.object({
  username: z.string().min(3, 'Username is too short'),
  password: z.string().min(3, 'Password is too short'),
  rememberMe: z.boolean().optional(),
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

  const { scale } = useSpring({
    from: { scale: 1 },
    to: async (next) => {
      while (true) {
        await next({ scale: 1.2 });
        await next({ scale: 1 });
      }
    },
    config: { duration: 800 },
  });

  const [rememberMe, setRememberMe] = useState(false);
  const checkboxAnimation = useSpring({
    backgroundColor: rememberMe ? 'rgba(37, 99, 235, 1)' : 'rgba(255, 255, 255, 1)', // Blue for admin
    borderColor: rememberMe ? 'rgba(37, 99, 235, 1)' : 'rgba(209, 213, 219, 1)',
    config: { tension: 300, friction: 20 },
  });

  const checkmarkAnimation = useSpring({
    opacity: rememberMe ? 1 : 0,
    transform: rememberMe ? 'scale(1)' : 'scale(0.5)',
    config: { tension: 300, friction: 20 },
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
    <div className="flex min-h-screen w-full items-center justify-center bg-white dark:bg-neutral-950">

      <div className="w-full max-w-md p-8">
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

          <div className="flex items-center justify-between">
            <div
              className="flex cursor-pointer items-center gap-2"
              onClick={() => setRememberMe(!rememberMe)}
            >
              <animated.div
                style={checkboxAnimation}
                className="flex h-5 w-5 items-center justify-center rounded border transition-colors"
              >
                <animated.div style={checkmarkAnimation}>
                  <Check size={14} className="text-white" strokeWidth={3} />
                </animated.div>
              </animated.div>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Remember me
              </span>
              <input
                type="hidden"
                {...register('rememberMe')}
                value={rememberMe.toString()}
              />
            </div>

            <button
              type="button"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
              onClick={() => console.log('Forgot password clicked')}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="squircle-xl h-12 w-full bg-blue-600 font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="absolute bottom-12 left-0 right-0 flex justify-center">
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
          >
            <HelpCircle size={16} />
            <span>Contact Support</span>
          </button>
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2 text-xs text-neutral-400">
          <span>Made with love</span>
          <animated.div style={{ transform: scale.to((s) => `scale(${s})`) }}>
            <Heart size={12} className="fill-red-500 text-red-500" />
          </animated.div>
          <span>by Reli-Light</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
