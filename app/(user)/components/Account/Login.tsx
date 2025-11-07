'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUserAuth } from '../../context/UserAuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const LoginSchema = z.object({
  phonenumber: z.string().min(10, 'invalid phone number'),
  password: z.string().min(3, 'password is too short'),
});

type LoginFormData = z.infer<typeof LoginSchema>;

const Login = () => {
  const { login } = useUserAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Login failed');
      }

      if (result.data) {
        login(result.data.user, result.data.token);
        router.push('/home');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials.'
      );
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-100vw min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="item-start flex h-[250px] w-full flex-col justify-center space-y-2 px-10"
      >
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="phonenumber"
            className="text-header-md tracking-tight"
          >
            Phone number
          </label>
          <input
            type="text"
            id="phonenumber"
            {...register('phonenumber')}
            className="border-border-default/20 h-[50px] rounded-full border-[0.5px] bg-neutral-100/20 px-2 text-[16px] text-neutral-900 transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            disabled={isLoading}
          />
          {errors.phonenumber && (
            <p className="text-regular-md tracking-tight text-red-600">
              {errors.phonenumber.message}
            </p>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="password" className="text-header-md tracking-tight">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              {...register('password')}
              className="border-border-default/20 h-[50px] w-full rounded-full border-[0.5px] bg-neutral-100/20 px-2 pr-12 text-[16px] text-neutral-900 transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-regular-md tracking-tight text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>{/* checkbox */}</div>

        <div className="flex h-[65px] w-full flex-row items-center justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="h-[60px] w-[200px] rounded-full bg-blue-600 px-4 py-2 text-white disabled:bg-gray-400"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
