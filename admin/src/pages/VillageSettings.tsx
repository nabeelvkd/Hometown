import { useEffect, useState } from 'react';
import { Field } from '../components/fields';
import { locationApi } from '../api/resources';
import { ApiError } from '../api/client';
import { useLocationScope } from '../location/LocationContext';

export function VillageSettings() {
  const { villageId, villages } = useLocationScope();
  const [heroImage, setHeroImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const villageName = villages.find((v) => v._id === villageId)?.name ?? 'your village';

  useEffect(() => {
    if (!villageId) return;
    setLoading(true);
    locationApi
      .getVillage(villageId)
      .then((r) => setHeroImage(r.data.heroImage ?? ''))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [villageId]);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    setError(null);
    try {
      await locationApi.updateVillage(villageId, { heroImage });
      setMsg('Saved. The mobile home screen will use this image.');
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  if (!villageId) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <p className="muted">Select a village first.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ marginTop: 0 }}>Home screen image · {villageName}</h3>
        <p className="muted" style={{ marginTop: 4 }}>
          This is the hero/cover image shown at the top of the mobile app for {villageName}.
        </p>

        {error && <div className="alert error" style={{ marginTop: 16 }}>{error}</div>}
        {msg && (
          <div className="alert" style={{ marginTop: 16, background: 'var(--primary-soft)', color: 'var(--primary-dark)' }}>
            {msg}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <Field label="Hero image URL">
            <input
              value={heroImage}
              onChange={(e) => setHeroImage(e.target.value)}
              placeholder="https://…/photo.jpg"
              disabled={loading}
            />
          </Field>

          {heroImage ? (
            <img
              src={heroImage}
              alt="Hero preview"
              style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border)' }}
              onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.3')}
            />
          ) : (
            <div
              style={{
                height: 180,
                borderRadius: 12,
                border: '1px dashed var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                background: 'var(--surface-alt)',
              }}>
              No image set — the app shows a default.
            </div>
          )}

          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button className="btn" onClick={save} disabled={saving || loading}>
              {saving ? 'Saving…' : 'Save image'}
            </button>
            {heroImage && (
              <button className="btn secondary" onClick={() => setHeroImage('')} disabled={saving}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
