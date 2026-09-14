import { proxyToBackend } from '@/lib/proxy';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(request, `/api/payments/${id}/mpesa/`, {
    method: 'POST',
    body: await request.text(),
  });
}
