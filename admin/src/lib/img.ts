// Inserts a Cloudinary transform so previews load a small, optimized image.
// Non-Cloudinary URLs pass through unchanged.
export type ImgPreset = 'thumb' | 'avatar' | 'card' | 'hero';

const TRANSFORMS: Record<ImgPreset, string> = {
  thumb: 'c_fill,g_auto,w_96,h_96,q_auto,f_auto',
  avatar: 'c_fill,g_auto,w_160,h_160,q_auto,f_auto',
  card: 'c_fill,w_400,h_260,q_auto,f_auto',
  hero: 'c_fill,w_640,h_300,q_auto,f_auto',
};

export function img(url?: string, preset: ImgPreset = 'card'): string | undefined {
  if (!url) return url;
  const marker = '/upload/';
  const i = url.indexOf(marker);
  if (i === -1) return url;
  return url.slice(0, i + marker.length) + TRANSFORMS[preset] + '/' + url.slice(i + marker.length);
}
