import { proxyToBackend } from '@/lib/proxy';

export async function POST(request: Request) {
  return proxyToBackend(request, '/api/users/change_password/', { method: 'POST', body: await request.text() });
}
