import { useCallback, useEffect, useState } from 'react';
import { Modal } from '../components/Modal';
import { Field } from '../components/fields';
import { adApi } from '../api/resources';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { useLocationScope } from '../location/LocationContext';
import { ROLES, type Ad } from '../types';

const STATUS_BADGE: Record<string, string> = {
  approved: 'green',
  pending: 'amber',
  rejected: 'gray',
};

export function Ads() {
  const { user } = useAuth();
  const { villageId, villages } = useLocationScope();
  const isSuper = user?.role === ROLES.SUPER_ADMIN;

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', cta: 'Learn More', ctaUrl: '', image: '' });

  const load = useCallback(() => {
    setLoading(true);
    adApi
      .list()
      .then((r) => setAds(r.data))
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, []);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const create = async () => {
    setSaving(true);
    setError(null);
    try {
      await adApi.create({
        title: form.title,
        subtitle: form.subtitle || undefined,
        cta: form.cta || undefined,
        ctaUrl: form.ctaUrl || undefined,
        image: form.image || undefined,
        // super admin targets the selected village (optional => global)
        village: isSuper ? villageId || undefined : undefined,
      });
      setOpen(false);
      setForm({ title: '', subtitle: '', cta: 'Learn More', ctaUrl: '', image: '' });
      load();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  const review = async (id: string, body: { status?: string; isActive?: boolean }) => {
    try {
      await adApi.review(id, body);
      load();
    } catch (e) {
      setError((e as ApiError).message);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this ad?')) return;
    await adApi.remove(id).catch((e) => setError((e as ApiError).message));
    load();
  };

  const villageName = (v: Ad['village']) =>
    !v ? 'All villages' : typeof v === 'object' ? v.name : villages.find((x) => x._id === v)?.name ?? 'Village';

  return (
    <div>
      <div className="toolbar">
        <div className="muted">
          {isSuper
            ? 'Review submitted ads and publish your own.'
            : 'Submit ads for your village. They go live after super-admin approval.'}
        </div>
        <button className="btn" onClick={() => setOpen(true)}>
          + Create ad
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="card table-wrap">
        {loading ? (
          <div className="loading">Loading…</div>
        ) : ads.length === 0 ? (
          <div className="empty">No ads yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ad</th>
                <th>Village</th>
                <th>Status</th>
                <th>Active</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad._id}>
                  <td>
                    <strong>{ad.title}</strong>
                    {ad.subtitle && <div className="muted">{ad.subtitle}</div>}
                  </td>
                  <td>{villageName(ad.village)}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[ad.status] ?? 'gray'}`}>{ad.status}</span>
                  </td>
                  <td>{ad.isActive ? 'Yes' : 'No'}</td>
                  <td>
                    <div className="row-actions">
                      {isSuper && ad.status === 'pending' && (
                        <>
                          <button className="btn-link" onClick={() => review(ad._id, { status: 'approved' })}>
                            Approve
                          </button>
                          <button className="btn-link danger" onClick={() => review(ad._id, { status: 'rejected' })}>
                            Reject
                          </button>
                        </>
                      )}
                      {isSuper && ad.status === 'approved' && (
                        <button className="btn-link" onClick={() => review(ad._id, { isActive: !ad.isActive })}>
                          {ad.isActive ? 'Disable' : 'Enable'}
                        </button>
                      )}
                      <button className="btn-link danger" onClick={() => remove(ad._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <Modal
          title="Create ad"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn" onClick={create} disabled={saving || !form.title.trim()}>
                {saving ? 'Saving…' : isSuper ? 'Publish' : 'Submit for approval'}
              </button>
            </>
          }
        >
          {error && <div className="alert error">{error}</div>}
          {!isSuper && (
            <p className="muted" style={{ marginTop: 0 }}>
              This ad will be submitted for your village and shown after the super admin approves it.
            </p>
          )}
          <Field label="Title" required>
            <input value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Grow your business" />
          </Field>
          <Field label="Subtitle">
            <input value={form.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
          </Field>
          <div className="field-row">
            <Field label="Button text">
              <input value={form.cta} onChange={(e) => set({ cta: e.target.value })} />
            </Field>
            <Field label="Button link (URL)">
              <input value={form.ctaUrl} onChange={(e) => set({ ctaUrl: e.target.value })} placeholder="https://…" />
            </Field>
          </div>
          <Field label="Image URL">
            <input value={form.image} onChange={(e) => set({ image: e.target.value })} placeholder="https://…" />
          </Field>
        </Modal>
      )}
    </div>
  );
}
