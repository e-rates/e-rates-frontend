import { BACKEND_URL } from '@/lib/backend';
import { NextResponse } from 'next/server';

export async function proxyToBackend(
  request: Request,
  path: string,
  init: { method?: string; body?: string } = {}
) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: init.method ?? 'GET',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: init.body,
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, {
      status: response.status,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error(`Proxy error for ${path}:`, error);
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}
