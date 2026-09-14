import { authService } from './auth';

export class SessionExpiredError extends Error {
  constructor() {
    super('Your session has expired. Please sign in again.');
    this.name = 'SessionExpiredError';
  }
}

// In the browser, always use relative URLs ('') so client requests go through the Next.js reverse proxy.
// On the server (SSR / API routes), connect directly to Django backend on localhost:8000.
export const BACKEND_URL =
  typeof window !== 'undefined'
    ? ''
    : (process.env.INTERNAL_BACKEND_URL || process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000');

export async function backendFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = await authService.getValidAccessToken();
  if (!token) throw new SessionExpiredError();
  return fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function backendJson<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await backendFetch(path, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = String(body.error || body.detail || '');
    const isPermissionError =
      response.status === 401 ||
      (response.status === 403 &&
        (errorMsg.toLowerCase().includes('permission') ||
          errorMsg.toLowerCase().includes('not authorized') ||
          errorMsg.toLowerCase().includes('credentials')));

    if (isPermissionError) {
      if (typeof window !== 'undefined') {
        authService.logout();
        const target = window.location.pathname.startsWith('/dashboard')
          ? '/admin-login'
          : '/account';
        if (window.location.pathname !== target) {
          window.location.href = target;
        }
      }
      return {} as T;
    }

    throw new Error(
      body.error || body.detail || `Request failed (${response.status})`
    );
  }
  return body as T;
}
