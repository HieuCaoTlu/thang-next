import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

const PUBLIC_IDS: Record<string, string> = {
  actual: 'dashboard/actual',
  plan: 'dashboard/plan',
  inventory_overview: 'dashboard/inventory_overview',
  inventory_detailed: 'dashboard/inventory_detailed',
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const type = formData.get('type') as string | null;

  if (!file || !type || !PUBLIC_IDS[type]) {
    return NextResponse.json({ error: 'Thiếu file hoặc type không hợp lệ' }, { status: 400 });
  }

  const publicId = PUBLIC_IDS[type];
  const timestamp = Math.floor(Date.now() / 1000);

  // resource_type không được ký — chỉ ký các params gửi trong body (trừ file, api_key, resource_type)
  const paramsToSign = `overwrite=true&public_id=${publicId}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + API_SECRET)
    .digest('hex');

  const uploadForm = new FormData();
  uploadForm.append('file', file);
  uploadForm.append('public_id', publicId);
  uploadForm.append('overwrite', 'true');
  uploadForm.append('resource_type', 'raw');
  uploadForm.append('timestamp', String(timestamp));
  uploadForm.append('api_key', API_KEY);
  uploadForm.append('signature', signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
    { method: 'POST', body: uploadForm }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: (err as any).error?.message ?? 'Upload thất bại' },
      { status: 500 }
    );
  }

  const data = await res.json() as { secure_url: string; public_id: string };
  return NextResponse.json({ url: data.secure_url, publicId: data.public_id });
}
