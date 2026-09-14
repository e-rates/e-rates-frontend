import { proxyToBackend } from '@/lib/proxy';

export async function GET(request: Request) {
  const { search } = new URL(request.url);
  return proxyToBackend(request, `/api/payments/${search}`);
}
