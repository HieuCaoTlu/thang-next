import { NextRequest, NextResponse } from 'next/server';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

const PUBLIC_IDS: Record<string, string> = {
  actual: 'dashboard/actual',
  plan: 'dashboard/plan',
};

// Trả về secure_url + version của file hiện tại trên Cloudinary
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type');
  if (!type || !PUBLIC_IDS[type]) {
    return NextResponse.json({ error: 'type không hợp lệ' }, { status: 400 });
  }

  const publicId = PUBLIC_IDS[type];

  // Admin API dùng Basic Auth, public_id encode làm query param
  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/raw/upload?public_id=${encodeURIComponent(publicId)}`,
    { method: 'GET', headers: { Authorization: `Basic ${auth}` } }
  );

  if (!res.ok) {
    // File chưa tồn tại hoặc lỗi
    return NextResponse.json({ url: null, version: null });
  }

  const data = await res.json() as { resources?: { secure_url: string; version: number }[] };
  const resource = data.resources?.[0];
  if (!resource) return NextResponse.json({ url: null, version: null });
  return NextResponse.json({ url: resource.secure_url, version: resource.version });
}
