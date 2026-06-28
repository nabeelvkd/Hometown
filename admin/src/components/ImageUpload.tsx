import { useCallback, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { uploadImage } from '../api/client';
import { img, type ImgPreset } from '../lib/img';

interface Props {
  value?: string;
  onChange: (url: string) => void;
  /** Preview shape: 'avatar' (round) for profile photos, else a banner. */
  shape?: 'avatar' | 'banner';
  preset?: ImgPreset;
  /**
   * Crop/align aspect (width:height). Defaults by shape (1:1 for avatars,
   * 3:2 for banners) so every upload can be cropped and adjusted.
   */
  aspect?: number;
}

type PixelArea = { x: number; y: number; width: number; height: number };

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error('read failed'));
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error('image load failed'));
    im.src = src;
  });
}

/**
 * Renders the selected crop region to a compressed JPEG blob — downscaled to a
 * sensible max size and re-encoded so we upload far less data to Cloudinary.
 */
async function cropToBlob(src: string, area: PixelArea): Promise<Blob> {
  const image = await loadImage(src);
  const maxEdge = 1280;
  const longest = Math.max(area.width, area.height);
  const scale = longest > maxEdge ? maxEdge / longest : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(area.width * scale));
  canvas.height = Math.max(1, Math.round(area.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Could not crop image'))),
      'image/jpeg',
      0.82
    )
  );
}

/**
 * Uploads an image to Cloudinary (via the backend) and returns its URL.
 * With `aspect`, the user first crops/aligns the image to fit the target.
 */
export function ImageUpload({ value, onChange, shape = 'banner', preset = 'card', aspect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Crop modal state
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<PixelArea | null>(null);

  // Every upload is croppable; avatars default to square, banners to 3:2.
  const cropAspect = aspect ?? (shape === 'avatar' ? 1 : 1.5);

  const pick = () => inputRef.current?.click();

  const upload = async (file: File | Blob, name = 'image.jpg') => {
    setBusy(true);
    setError(null);
    try {
      const f = file instanceof File ? file : new File([file], name, { type: 'image/jpeg' });
      const url = await uploadImage(f);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setAreaPixels(null);
      setRawImage(dataUrl);
    } catch {
      setError('Could not read the image');
    }
  };

  const onCropComplete = useCallback((_area: PixelArea, areaPx: PixelArea) => {
    setAreaPixels(areaPx);
  }, []);

  const confirmCrop = async () => {
    if (!rawImage || !areaPixels) return;
    try {
      const blob = await cropToBlob(rawImage, areaPixels);
      setRawImage(null);
      await upload(blob, 'banner.jpg');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not crop image');
    }
  };

  const avatar = shape === 'avatar';
  const previewW = avatar ? 72 : 160;
  const previewH = avatar ? 72 : 64;

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {value ? (
          <img
            src={img(value, avatar ? 'avatar' : preset)}
            alt="preview"
            style={{
              width: previewW,
              height: previewH,
              objectFit: 'cover',
              borderRadius: avatar ? '50%' : 10,
              border: '1px solid var(--border)',
              background: 'var(--surface-alt)',
            }}
          />
        ) : (
          <div
            style={{
              width: previewW,
              height: previewH,
              borderRadius: avatar ? '50%' : 10,
              border: '1px dashed var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: 11,
              textAlign: 'center',
            }}>
            No image
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn secondary sm" onClick={pick} disabled={busy}>
            {busy ? 'Uploading…' : value ? 'Replace' : 'Upload image'}
          </button>
          {value && (
            <button type="button" className="btn secondary sm" onClick={pick} disabled={busy}>
              Reposition / crop
            </button>
          )}
          {value && (
            <button type="button" className="btn-link danger" onClick={() => onChange('')} disabled={busy}>
              Remove
            </button>
          )}
        </div>
      </div>
      {error && <div className="alert error" style={{ marginTop: 8 }}>{error}</div>}
      <input ref={inputRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />

      {rawImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}>
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 14,
              width: 'min(680px, 100%)',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: 16,
            }}>
            <h3 style={{ margin: '0 0 4px' }}>Position &amp; crop</h3>
            <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>
              Drag to move and zoom so the important part stays inside the frame. This is exactly
              what shows in the banner.
            </p>
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 320,
                background: '#000',
                borderRadius: 10,
                overflow: 'hidden',
              }}>
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={cropAspect}
                cropShape={shape === 'avatar' ? 'round' : 'rect'}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                objectFit="contain"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
              <span className="muted" style={{ fontSize: 13 }}>Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <button type="button" className="btn secondary" onClick={() => setRawImage(null)} disabled={busy}>
                Cancel
              </button>
              <button type="button" className="btn" onClick={confirmCrop} disabled={busy || !areaPixels}>
                {busy ? 'Uploading…' : 'Use image'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
