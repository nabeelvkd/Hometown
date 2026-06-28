import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true,
});

export const isCloudinaryConfigured = (): boolean =>
  Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);

/**
 * Uploads an image buffer to Cloudinary and resolves the secure URL + id.
 *
 * An incoming transformation runs BEFORE the asset is stored, so the saved
 * original is already capped to 1600px and quality-optimized (q_auto) — this
 * keeps Cloudinary storage + delivery small regardless of the source file size.
 */
export function uploadImage(
  buffer: Buffer,
  folder = 'nattile'
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto:good' }],
      },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error('Upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Recovers the Cloudinary public_id (e.g. "nattile/abc123") from a stored
 * secure URL — stripping any transformation segment, the version prefix, and
 * the file extension. Returns null for non-Cloudinary URLs (e.g. seeded
 * Unsplash links), so cleanup safely ignores them.
 */
export function publicIdFromUrl(url?: string | null): string | null {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  const at = url.indexOf('/upload/');
  if (at === -1) return null;
  const segments = url
    .slice(at + '/upload/'.length)
    .split('/')
    .filter(Boolean);
  // Drop a leading on-the-fly transformation segment (e.g. "w_220,c_fill").
  while (segments.length && segments[0].includes(',')) segments.shift();
  // Drop the version segment (e.g. "v1782412122").
  if (segments.length && /^v\d+$/.test(segments[0])) segments.shift();
  if (!segments.length) return null;
  return segments.join('/').replace(/\.[^/.]+$/, ''); // strip extension
}

/**
 * Best-effort delete of a previously uploaded image. Never throws — orphan
 * cleanup must never fail the request that triggered it. No-ops for non-
 * Cloudinary URLs or when Cloudinary isn't configured.
 */
export async function destroyImage(url?: string | null): Promise<void> {
  const publicId = publicIdFromUrl(url);
  if (!publicId || !isCloudinaryConfigured()) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
  } catch {
    // swallow — see doc comment
  }
}

/** Best-effort delete of many images (see {@link destroyImage}). */
export async function destroyImages(urls: Array<string | null | undefined>): Promise<void> {
  await Promise.all(urls.map((u) => destroyImage(u)));
}
