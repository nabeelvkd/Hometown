import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { Field } from '../components/fields';
import { homeCategoryApi } from '../api/resources';
import { ApiError } from '../api/client';
import { useLocationScope } from '../location/LocationContext';
import { CATEGORY_ICONS } from '../constants';
import type { HomeCategory } from '../types';

type Template = 'link' | 'directory' | 'places';

interface FormState {
  label: string;
  sub: string;
  icon: string;
  color: string;
  link: string;
  template: Template;
}

const blank: FormState = { label: '', sub: '', icon: 'layout-grid', color: '#16A34A', link: '', template: 'link' };

const TEMPLATE_OPTIONS: { value: Template; label: string }[] = [
  { value: 'link', label: 'Link — opens a website' },
  { value: 'directory', label: 'Directory — list of contacts (photo + call)' },
  { value: 'places', label: 'Places — list of cards (image + details)' },
];

export function Categories() {
  const navigate = useNavigate();
  const { villageId, villages } = useLocationScope();
  const [cats, setCats] = useState<HomeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<HomeCategory | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(blank);
  const [saving, setSaving] = useState(false);

  const villageName = villages.find((v) => v._id === villageId)?.name ?? 'your village';

  const load = useCallback(() => {
    if (!villageId) return;
    setLoading(true);
    homeCategoryApi
      .adminList(villageId)
      .then((r) => setCats(r.data))
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [villageId]);
  useEffect(load, [load]);

  const move = (idx: number, dir: -1 | 1) => {
    const swap = idx + dir;
    if (swap < 0 || swap >= cats.length) return;
    const next = [...cats];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setCats(next); // optimistic
    homeCategoryApi
      .reorder(villageId, next.map((c) => c._id))
      .then((r) => setCats(r.data))
      .catch((e: ApiError) => {
        setError(e.message);
        load();
      });
  };

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const openCreate = () => {
    setForm(blank);
    setCreating(true);
    setError(null);
  };
  const openEdit = (c: HomeCategory) => {
    setForm({
      label: c.label,
      sub: c.sub ?? '',
      icon: c.icon,
      color: c.color,
      link: c.link ?? '',
      template: c.template ?? 'link',
    });
    setEditing(c);
    setError(null);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await homeCategoryApi.update(editing._id, {
          label: form.label,
          sub: form.sub,
          icon: form.icon,
          color: form.color,
          link: form.template === 'link' ? form.link : '',
          template: form.template,
        });
      } else {
        await homeCategoryApi.create({
          ...form,
          link: form.template === 'link' ? form.link : undefined,
          village: villageId,
        });
      }
      setEditing(null);
      setCreating(false);
      load();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = (c: HomeCategory) =>
    homeCategoryApi.update(c._id, { isActive: !c.isActive }).then(load).catch((e) => setError((e as ApiError).message));

  const remove = (c: HomeCategory) => {
    if (!window.confirm(`Delete "${c.label}"?`)) return;
    homeCategoryApi.remove(c._id).then(load).catch((e) => setError((e as ApiError).message));
  };

  if (!villageId) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <p className="muted">Select a village first.</p>
      </div>
    );
  }

  const open = creating || editing;

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="toolbar">
        <div className="muted">
          Home tiles for <strong>{villageName}</strong> — drag order with the arrows. The app shows 8,
          the rest go under “More”.
        </div>
        <button className="btn" onClick={openCreate}>+ Add category</button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="card table-wrap">
        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 70 }}>Order</th>
                <th>Category</th>
                <th>Type</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cats.map((c, i) => (
                <tr key={c._id} style={{ opacity: c.isActive ? 1 : 0.5 }}>
                  <td>
                    <div className="row-actions">
                      <button className="btn-link" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                      <button className="btn-link" disabled={i === cats.length - 1} onClick={() => move(i, 1)}>↓</button>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          width: 30, height: 30, borderRadius: 8, display: 'inline-flex',
                          alignItems: 'center', justifyContent: 'center', fontSize: 11,
                          background: c.color + '22', color: c.color, fontWeight: 700,
                        }}
                        title={c.icon}>
                        {c.icon.slice(0, 2)}
                      </span>
                      <div>
                        <strong>{c.label}</strong>
                        {c.sub && <div className="muted" style={{ fontSize: 12 }}>{c.sub}</div>}
                        {c.link && <div className="muted" style={{ fontSize: 11 }}>↗ {c.link}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    {c.isCustom ? <span className="badge green">Custom</span> : <span className="badge gray">Built-in</span>}
                    {!c.isActive && <span className="badge amber" style={{ marginLeft: 4 }}>Hidden</span>}
                  </td>
                  <td>
                    <div className="row-actions">
                      {c.isCustom && c.template !== 'link' && (
                        <button
                          className="btn-link"
                          onClick={() => navigate(`/category-items/${c._id}`, { state: { category: c } })}>
                          Items
                        </button>
                      )}
                      <button className="btn-link" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn-link" onClick={() => toggleActive(c)}>
                        {c.isActive ? 'Hide' : 'Show'}
                      </button>
                      {c.isCustom && (
                        <button className="btn-link danger" onClick={() => remove(c)}>Delete</button>
                      )}
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
          title={editing ? `Edit · ${editing.label}` : 'Add category'}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          footer={
            <>
              <button className="btn secondary" onClick={() => { setEditing(null); setCreating(false); }}>Cancel</button>
              <button className="btn" onClick={save} disabled={saving || !form.label.trim()}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          }>
          {error && <div className="alert error">{error}</div>}
          <div className="field-row">
            <Field label="Label" required>
              <input value={form.label} onChange={(e) => set({ label: e.target.value })} placeholder="e.g. Tourism" />
            </Field>
            <Field label="Subtitle">
              <input value={form.sub} onChange={(e) => set({ sub: e.target.value })} placeholder="Places to visit" />
            </Field>
          </div>
          <div className="field-row">
            <Field label="Icon">
              <select value={form.icon} onChange={(e) => set({ icon: e.target.value })}>
                {CATEGORY_ICONS.map((ic) => (
                  <option key={ic} value={ic}>{ic}</option>
                ))}
              </select>
            </Field>
            <Field label="Color">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={form.color} onChange={(e) => set({ color: e.target.value })} style={{ width: 48, padding: 2 }} />
                <input value={form.color} onChange={(e) => set({ color: e.target.value })} />
              </div>
            </Field>
          </div>
          {(!editing || editing.isCustom) && (
            <Field label="What it opens">
              <select value={form.template} onChange={(e) => set({ template: e.target.value as Template })}>
                {TEMPLATE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>
          )}
          {form.template === 'link' && (!editing || editing.isCustom) && (
            <Field label="Link URL">
              <input value={form.link} onChange={(e) => set({ link: e.target.value })} placeholder="https://…" />
            </Field>
          )}
          {form.template !== 'link' && (
            <p className="muted" style={{ fontSize: 12 }}>
              After saving, use the <strong>Items</strong> action on this category to add entries.
            </p>
          )}
          {editing && !editing.isCustom && (
            <p className="muted" style={{ fontSize: 12 }}>
              Built-in tile — it keeps its app behavior; here you can restyle/rename it.
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
