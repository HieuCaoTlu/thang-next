export interface CacheEntry {
  fileName: string;
  cloudinaryUrl: string;
  publicId: string;
  version: number;
  parsedData: unknown;
  uploadedAt: number;
}

export type FileType = 'actual' | 'plan';

const CACHE_KEYS: Record<FileType, string> = {
  actual: 'dashboard_actual_cache',
  plan: 'dashboard_plan_cache',
};

export function getCached(type: FileType): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEYS[type]);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }
}

export function setCached(type: FileType, entry: CacheEntry): void {
  localStorage.setItem(CACHE_KEYS[type], JSON.stringify(entry));
}

export function clearCache(type: FileType): void {
  localStorage.removeItem(CACHE_KEYS[type]);
}

// Kiểm tra Cloudinary có file mới hơn cache không
// Trả về url nếu cần fetch lại, null nếu cache còn mới
export async function checkForUpdate(type: FileType): Promise<{ url: string; version: number } | null> {
  const res = await fetch(`/api/file-url?type=${type}`);
  if (!res.ok) return null;
  const data = await res.json() as { url: string | null; version: number | null };
  if (!data.url || !data.version) return null;

  const cached = getCached(type);
  if (cached && cached.version === data.version) return null; // Cache còn mới

  return { url: data.url, version: data.version };
}

// Upload file lên Cloudinary qua API route (có signed upload)
export async function uploadFile(
  file: File,
  type: FileType,
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error ?? 'Upload thất bại');
  }
  return res.json();
}
