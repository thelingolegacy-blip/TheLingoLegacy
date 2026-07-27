import { type NextRequest } from 'next/server';
import { json, options } from '@/lib/http';
import { minio } from '@/lib/minio';

export const runtime = 'nodejs';

export async function OPTIONS() {
  return options();
}

export async function POST(req: NextRequest) {
  const { bucket, file } = (await req.json()) as { bucket?: string; file?: string };
  if (!bucket || !file) return json({ error: 'bucket and file are required' }, { status: 400 });

  try {
    const url = await minio.presignedUrl('GET', bucket, file);
    return json({ url });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'asset lookup failed' }, { status: 500 });
  }
}
