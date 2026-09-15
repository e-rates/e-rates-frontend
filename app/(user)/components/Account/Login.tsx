'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import Image from 'next/image';
import { Eye, EyeOff, Check, HelpCircle } from 'lucide-react';
import { MapPinIcon, CreditCardIcon, ShieldCheckIcon } from '@/components/icons';

const loginSchema = z.object({
  phonenumber: z.string().min(1, 'Phone number is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const field =
  'w-full rounded-xl bg-neutral-100/80 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-800/80 dark:text-white dark:placeholder:text-neutral-500 dark:focus:ring-white transition-all';

const Login: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Read any previously selected county from localStorage after mounting (prevents SSR hydration mismatch)
  const [lastCounty, setLastCounty] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    // Sanitize URL immediately if sensitive parameters leaked in query string
    if (typeof window !== 'undefined' && (window.location.search.includes('password') || window.location.search.includes('phonenumber') || window.location.search.includes('phone'))) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    const saved = localStorage.getItem('countyName');
    if (saved) {
      setLastCounty(saved);
      setLogoFailed(false);
    }
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phonenumber: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phonenumber: data.phonenumber,
          password: data.password,
        }),
      });

      let resData: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        resData = await response.json().catch(() => null);
      } else {
        await response.text().catch(() => '');
      }

      if (!response.ok || !resData?.success) {
        let errorMsg = 'Invalid phone number or password.';
        if (resData?.error) {
          errorMsg = typeof resData.error === 'string' ? resData.error : JSON.stringify(resData.error);
        } else if (resData?.message) {
          errorMsg = typeof resData.message === 'string' ? resData.message : JSON.stringify(resData.message);
        } else if (resData?.detail) {
          errorMsg = typeof resData.detail === 'string' ? resData.detail : JSON.stringify(resData.detail);
        } else if (response.status === 401 || response.status === 400) {
          errorMsg = 'Invalid phone number or password.';
        } else if (response.status >= 500) {
          errorMsg = 'Authentication service is temporarily unavailable. Please try again.';
        }
        throw new Error(errorMsg);
      }

      const tokenData = resData.data;
      authService.setTokens(tokenData.access, tokenData.refresh);

      // Fetch user profile to get county and details
      const profileRes = await fetch('/api/users/me/', {
        headers: { Authorization: `Bearer ${tokenData.access}` },
      });

      if (profileRes.ok) {
        const user = await profileRes.json().catch(() => null);
        const cName = user?.county_name || user?.county;
        if (cName) {
          localStorage.setItem('countyName', cName);
          setLastCounty(cName);
        }
      }

      window.location.href = '/';
    } catch (err: unknown) {
      let message = 'Unable to sign in. Please try again.';
      if (err instanceof Error) {
        if (err.message.includes('<!DOCTYPE') || err.message.includes('Unexpected token') || err.message.includes('JSON')) {
          message = 'Authentication server returned an unexpected response. Please try again.';
        } else {
          message = err.message;
        }
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizedCounty = lastCounty ? lastCounty.replace(/\s+county$/i, '') : null;
  const countyLogo = normalizedCounty ? `/${normalizedCounty.toLowerCase()}-logo.png` : null;

  return (
    <div className="flex flex-col justify-center min-h-screen w-full py-6 md:py-0 md:grid md:grid-cols-2 md:h-screen md:max-h-screen md:overflow-hidden">
      {/* Left side: Kenya & County Branding */}
      {/* Left side: Official Kenya & County Branding */}
      <div className="flex flex-col justify-between h-full px-6 pt-6 pb-6 sm:px-8 md:p-10 lg:p-12 xl:p-14 md:border-r border-neutral-200/60 dark:border-neutral-800/60">
        {/* Grouped Header + Platform Info so space below State Dept is tight & natural */}
        <div className="space-y-6">
          {/* Top: Kenya Crest + County Logo */}
          <div className="w-full max-w-[360px] sm:max-w-[380px] mx-auto md:max-w-none md:mx-0 text-center md:text-left">
            <div className="mb-3 flex items-center justify-center md:justify-start gap-4">
              <Image
                src="/kenya-logo.svg"
                alt="Republic of Kenya Coat of Arms"
                width={64}
                height={64}
                priority
                className="h-12 w-auto object-contain md:h-16"
              />
              {countyLogo && !logoFailed ? (
                <>
                  <div className="h-10 w-px bg-neutral-200 dark:bg-neutral-800" />
                  <Image
                    src={countyLogo}
                    alt={`${normalizedCounty} County logo`}
                    width={64}
                    height={64}
                    unoptimized
                    onError={() => setLogoFailed(true)}
                    className="h-12 w-auto object-contain md:h-16"
                  />
                </>
              ) : null}
            </div>

            <h1 className="text-lg font-bold tracking-tight text-neutral-900 uppercase sm:text-2xl dark:text-white">
              Republic of Kenya
            </h1>
            <p className="mt-0.5 text-xs font-semibold text-neutral-800 sm:text-base dark:text-neutral-200">
              {normalizedCounty ? `${normalizedCounty.toUpperCase()} COUNTY • LAND RATES` : 'National Land Rates Management System'}
            </p>
            <p className="mt-0.5 text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400">
              State Department for Lands &amp; Physical Planning
            </p>
          </div>

          {/* Part below State Department: Clean, borderless, content-rich, no icons */}
          <div className="hidden md:block space-y-4 text-left">
            <p className="text-[12.5px] leading-relaxed text-neutral-600 dark:text-neutral-300">
              Self-service portal for land rates payments, parcel inquiries, and compliance certificates across Kenya&apos;s county governments.
            </p>

            {/* Feature rows — sharp corners, lighter bg, faint border-b, varied text length */}
            <div className="space-y-1.5 pt-1">
              <div className="border-b border-neutral-200/50 bg-neutral-50/50 px-3 py-2.5 dark:border-neutral-800/60 dark:bg-neutral-800/20">
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Parcel Inquiries</p>
                <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                  Instant search by plot number, title reference, or LR identifier
                </p>
              </div>

              <div className="border-b border-neutral-200/50 bg-neutral-50/50 px-3 py-2.5 dark:border-neutral-800/60 dark:bg-neutral-800/20">
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">M-Pesa Payment Receipts</p>
                <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                  Live payment verification with immediate digital receipts
                </p>
              </div>

              <div className="border-b border-neutral-200/50 bg-neutral-50/50 px-3 py-2.5 dark:border-neutral-800/60 dark:bg-neutral-800/20">
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Rates Clearance Certificate</p>
                <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                  Official certificates issued on zero arrears balance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Ratepayer Footer Note */}
        <div className="hidden md:flex items-center gap-2 pt-6 text-[11px] text-neutral-400 dark:text-neutral-500">
          <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
          <span>Ratepayer Self-Service Portal · Kenya County Governments</span>
        </div>
      </div>

      {/* Right side: Form (No borders, no shadows, sits cleanly under header on mobile) */}
      <div className="flex flex-col items-center justify-start md:justify-center px-6 pt-4 pb-6 sm:px-8 md:p-10 lg:p-12 xl:p-14">
        <div className="w-full max-w-[360px] sm:max-w-[380px]">
          <div className="mb-5 text-center md:text-left">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
              Ratepayer sign in
            </h2>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Sign in with your registered mobile phone number
            </p>
          </div>

          <form method="POST" action="#" onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit)(e); }} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400 text-left">
                {error}
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label htmlFor="phonenumber" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Phone number
              </label>
              <input
                id="phonenumber"
                type="tel"
                autoComplete="tel"
                {...register('phonenumber')}
                className={field}
                placeholder="e.g. 0712345678"
                disabled={isLoading}
              />
              {errors.phonenumber && <p className="text-xs text-red-600 dark:text-red-400">{errors.phonenumber.message}</p>}
            </div>

            <div className="space-y-1.5 text-left">
              <label htmlFor="password" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className={`${field} pr-12`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <button
                type="button"
                onClick={() => {
                  const next = !rememberMe;
                  setRememberMe(next);
                  setValue('rememberMe', next);
                }}
                className="flex items-center gap-2.5 text-sm text-neutral-600 select-none dark:text-neutral-400"
              >
                <span
                  className={`flex h-4.5 w-4.5 items-center justify-center rounded-md transition-colors ${
                    rememberMe
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700'
                  }`}
                >
                  {rememberMe && <Check size={12} strokeWidth={3} />}
                </span>
                Remember me
              </button>

              <button
                type="button"
                className="text-sm text-neutral-500 transition-colors hover:text-neutral-800 hover:underline dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-11 w-full rounded-xl bg-neutral-900 text-sm font-semibold text-white transition-all hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-5 flex justify-center">
            <button
              type="button"
              className="flex items-center gap-2 text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <HelpCircle size={14} />
              Contact support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
