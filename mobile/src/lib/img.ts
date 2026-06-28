// Inserts a Cloudinary transformation into an image URL so we fetch an
// appropriately-sized, optimized image. Non-Cloudinary URLs pass through
// unchanged (e.g. the bundled Unsplash sample images).
export type ImgPreset = 'thumb' | 'avatar' | 'card' | 'banner' | 'gallery' | 'hero';

const TRANSFORMS: Record<ImgPreset, string> = {
  thumb: 'c_fill,g_auto,w_96,h_96,q_auto,f_auto',
  avatar: 'c_fill,g_auto,w_220,h_220,q_auto,f_auto',
  card: 'c_fill,w_500,h_360,q_auto,f_auto',
  // Wide ad-banner ratio (2.5:1) with smart-crop so it fills the banner cleanly.
  banner: 'c_fill,g_auto,w_900,h_360,q_auto,f_auto',
  gallery: 'c_limit,w_1000,q_auto,f_auto',
  hero: 'c_fill,w_1000,h_640,q_auto,f_auto',
};

export function img(url?: string, preset: ImgPreset = 'card'): string | undefined {
  if (!url) return url;
  const marker = '/upload/';
  const i = url.indexOf(marker);
  if (i === -1) return url; // not a Cloudinary URL — leave as-is
  return url.slice(0, i + marker.length) + TRANSFORMS[preset] + '/' + url.slice(i + marker.length);
}
