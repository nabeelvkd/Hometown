import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal } from '../components/Modal';
import { Field } from '../components/fields';
import { ImageUpload } from '../components/ImageUpload';
import { adApi } from '../api/resources';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { useLocationScope } from '../location/LocationContext';
import { ROLES, type Ad, type AdTarget } from '../types';

const STATUS_BADGE: Record<string, string> = {
  approved: 'green',
  pending: 'amber',
  rejected: 'gray',
};

export function Ads() {
  const { user } = useAuth();
  const { districts, blocks, villages, districtId, blockId, villageId } = useLocationScope();
  const isSuper = user?.role === ROLES.SUPER_ADMIN;

  const districtName = districts.find((d) => d._id === districtId)?.name;
  const blockName = blocks.find((b) => b._id === blockId)?.name;
  const selVillageName = villages.find((v) => v._id === villageId)?.name;

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [targetTouched, setTargetTouched] = useState(false);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    cta: 'Learn More',
    ctaUrl: '',
    image: '',
    target: 'village' as AdTarget,
  });

  // Super-admin filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('all');

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

  const blankForm = { title: '', subtitle: '', cta: 'Learn More', ctaUrl: '', image: '', target: 'village' as AdTarget };

  const openCreate = () => {
    setEditingId(null);
    setTargetTouched(false);
    setForm(blankForm);
    setError(null);
    setOpen(true);
  };

  const openEdit = (ad: Ad) => {
    setEditingId(ad._id);
    setTargetTouched(false);
    setForm({
      title: ad.title,
      subtitle: ad.subtitle ?? '',
      cta: ad.cta ?? 'Learn More',
      ctaUrl: ad.ctaUrl ?? '',
      image: ad.image ?? '',
      target: ad.target ?? (ad.village ? 'village' : 'all'),
    });
    setError(null);
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    // Targeting (super admin) uses the locality selected in the top bar. On edit
    // we only re-target when the target dropdown was actually changed.
    const targeting =
      isSuper && (!editingId || targetTouched)
        ? {
            target: form.target,
            village: form.target === 'village' ? villageId || undefined : undefined,
            block: form.target === 'block' ? blockId || undefined : undefined,
            district: form.target === 'district' ? districtId || undefined : undefined,
          }
        : {};
    const body = {
      title: form.title,
      subtitle: form.subtitle || undefined,
      cta: form.cta || undefined,
      ctaUrl: form.ctaUrl || undefined,
      image: form.image || undefined,
      ...targeting,
    };
    try {
      if (editingId) await adApi.update(editingId, body);
      else await adApi.create(body);
      setOpen(false);
      setEditingId(null);
      setForm(blankForm);
      load();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  // Whether the super admin has selected the locality their chosen target needs.
  // When editing without changing the target, no locality is required.
  const targetReady =
    !isSuper ||
    (!!editingId && !targetTouched) ||
    form.target === 'all' ||
    (form.target === 'village' && !!villageId) ||
    (form.target === 'block' && !!blockId) ||
    (form.target === 'district' && !!districtId);

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

  const nameOf = (v?: string | { _id: string; name: string }) =>
    !v ? undefined : typeof v === 'object' ? v.name : undefined;

  // Human label for where an ad shows (handles legacy ads without a target).
  const scopeLabel = useCallback(
    (ad: Ad): string => {
      switch (ad.target) {
        case 'all':
          return 'All villages';
        case 'district':
          return `District: ${nameOf(ad.district) ?? '—'}`;
        case 'block':
          return `Area: ${nameOf(ad.block) ?? '—'}`;
        case 'village':
          return nameOf(ad.village) ?? villages.find((x) => x._id === ad.village)?.name ?? 'Village';
        default:
          return ad.village
            ? nameOf(ad.village) ?? villages.find((x) => x._id === ad.village)?.name ?? 'Village'
            : 'All villages';
      }
    },
    [villages]
  );

  // Distinct "Shows to" values present in the ads, for the filter dropdown.
  const scopeOptions = useMemo(
    () => Array.from(new Set(ads.map(scopeLabel))).sort(),
    [ads, scopeLabel]
  );

  const visibleAds = useMemo(
    () =>
      ads.filter((a) => {
        const statusOk =
          statusFilter === 'all' ||
          (statusFilter === 'live' && a.status === 'approved' && a.isActive) ||
          (statusFilter === 'disabled' && a.status === 'approved' && !a.isActive) ||
          (statusFilter === 'pending' && a.status === 'pending') ||
          (statusFilter === 'rejected' && a.status === 'rejected');
        const scopeOk = scopeFilter === 'all' || scopeLabel(a) === scopeFilter;
        return statusOk && scopeOk;
      }),
    [ads, statusFilter, scopeFilter, scopeLabel]
  );

  return (
    <div>
      <div className="toolbar">
        <div className="muted">
          {isSuper
            ? 'Review submitted ads and publish your own.'
            : 'Submit ads for your village. They go live after super-admin approval.'}
        </div>
        <button className="btn" onClick={openCreate}>
          + Create ad
        </button>
      </div>

      {isSuper && (
        <div
          className="card"
          style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', padding: 12, marginBottom: 12 }}>
          <span className="muted" style={{ fontSize: 13 }}>Filter:</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 160 }}>
            <option value="all">All statuses</option>
            <option value="live">Live (active)</option>
            <option value="disabled">Disabled</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)} style={{ width: 220 }}>
            <option value="all">Any “shows to”</option>
            {scopeOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {(statusFilter !== 'all' || scopeFilter !== 'all') && (
            <button
              className="btn-link"
              onClick={() => {
                setStatusFilter('all');
                setScopeFilter('all');
              }}>
              Clear
            </button>
          )}
          <span className="muted" style={{ marginLeft: 'auto', fontSize: 13 }}>
            {visibleAds.length} of {ads.length}
          </span>
        </div>
      )}

      {error && <div className="alert error">{error}</div>}

      <div className="card table-wrap">
        {loading ? (
          <div className="loading">Loading…</div>
        ) : visibleAds.length === 0 ? (
          <div className="empty">{ads.length === 0 ? 'No ads yet.' : 'No ads match these filters.'}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ad</th>
                <th>Shows to</th>
                <th>Status</th>
                <th>Active</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleAds.map((ad) => (
                <tr key={ad._id}>
                  <td>
                    <strong>{ad.title}</strong>
                    {ad.subtitle && <div className="muted">{ad.subtitle}</div>}
                  </td>
                  <td>{scopeLabel(ad)}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[ad.status] ?? 'gray'}`}>{ad.status}</span>
                  </td>
                  <td>{ad.isActive ? 'Yes' : 'No'}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn-link" onClick={() => openEdit(ad)}>
                        Edit
                      </button>
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
          title={editingId ? 'Edit ad' : 'Create ad'}
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn" onClick={save} disabled={saving || !form.title.trim() || !targetReady}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : isSuper ? 'Publish' : 'Submit for approval'}
              </button>
            </>
          }
        >
          {error && <div className="alert error">{error}</div>}
          {!isSuper && (
            <p className="muted" style={{ marginTop: 0 }}>
              {editingId
                ? 'Editing resubmits this ad for super-admin approval.'
                : 'This ad will be submitted for your village and shown after the super admin approves it.'}
            </p>
          )}

          {isSuper && (
            <>
              <Field label="Show this ad to" required>
                <select
                  value={form.target}
                  onChange={(e) => {
                    set({ target: e.target.value as AdTarget });
                    setTargetTouched(true);
                  }}>
                  <option value="all">All villages (everywhere)</option>
                  <option value="district">Whole district{districtName ? ` · ${districtName}` : ''}</option>
                  <option value="block">Whole area{blockName ? ` · ${blockName}` : ''}</option>
                  <option value="village">Single village{selVillageName ? ` · ${selVillageName}` : ''}</option>
                </select>
              </Field>
              {editingId && !targetTouched ? (
                <p className="muted" style={{ marginTop: -6, fontSize: 13 }}>
                  Targeting unchanged. Change the dropdown to re-target (uses the top-bar locality).
                </p>
              ) : form.target === 'all' ? (
                <p className="muted" style={{ marginTop: -6, fontSize: 13 }}>
                  Shown on every village’s home screen.
                </p>
              ) : targetReady ? (
                <p className="muted" style={{ marginTop: -6, fontSize: 13 }}>
                  {form.target === 'district' && `Shown across ${districtName} (all its villages).`}
                  {form.target === 'block' && `Shown across ${blockName} (all its villages).`}
                  {form.target === 'village' && `Shown only in ${selVillageName}.`}
                </p>
              ) : (
                <div className="alert error" style={{ marginTop: 0 }}>
                  Select a{' '}
                  {form.target === 'village' ? 'village' : form.target === 'block' ? 'area' : 'district'}{' '}
                  in the top bar to target it.
                </div>
              )}
            </>
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
          <Field label="Image">
            <ImageUpload value={form.image} onChange={(url) => set({ image: url })} shape="banner" aspect={2.5} />
          </Field>
        </Modal>
      )}
    </div>
  );
}
