import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { Field } from '../components/fields';
import { ImageUpload } from '../components/ImageUpload';
import { categoryEntryApi } from '../api/resources';
import { ApiError } from '../api/client';
import { img } from '../lib/img';
import type { CategoryEntry, HomeCategory } from '../types';

interface FormState {
  title: string;
  subtitle: string;
  photo: string;
  phone: string;
  whatsapp: string;
  description: string;
  link: string;
}

const blank: FormState = { title: '', subtitle: '', photo: '', phone: '', whatsapp: '', description: '', link: '' };

export function CategoryItems() {
  const { categoryId = '' } = useParams();
  const navigate = useNavigate();
  const category = (useLocation().state as { category?: HomeCategory } | null)?.category;
  const template = category?.template ?? 'directory';
  const isDirectory = template === 'directory';

  const [items, setItems] = useState<CategoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<CategoryEntry | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(blank);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    categoryEntryApi
      .list(categoryId)
      .then((r) => setItems(r.data))
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [categoryId]);
  useEffect(load, [load]);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));
  const openCreate = () => { setForm(blank); setCreating(true); setError(null); };
  const openEdit = (e: CategoryEntry) => {
    setForm({
      title: e.title, subtitle: e.subtitle ?? '', photo: e.photo ?? '',
      phone: e.phone ?? '', whatsapp: e.whatsapp ?? '', description: e.description ?? '', link: e.link ?? '',
    });
    setEditing(e);
    setError(null);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        title: form.title,
        subtitle: form.subtitle || undefined,
        photo: form.photo || undefined,
        phone: form.phone || undefined,
        whatsapp: form.whatsapp || undefined,
        description: form.description || undefined,
        link: form.link || undefined,
      };
      if (editing) await categoryEntryApi.update(editing._id, body);
      else await categoryEntryApi.create({ ...body, category: categoryId });
      setEditing(null);
      setCreating(false);
      load();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = (e: CategoryEntry) => {
    if (!window.confirm(`Delete "${e.title}"?`)) return;
    categoryEntryApi.remove(e._id).then(load).catch((err) => setError((err as ApiError).message));
  };

  const open = creating || editing;

  return (
    <div style={{ maxWidth: 760 }}>
      <button className="btn-link" style={{ paddingLeft: 0 }} onClick={() => navigate('/categories')}>← Categories</button>
      <div className="toolbar">
        <h3 style={{ margin: 0 }}>
          {category?.label ?? 'Category'} items
          <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}> · {template} template</span>
        </h3>
        <button className="btn" onClick={openCreate}>+ Add item</button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="card table-wrap">
        {loading ? (
          <div className="loading">Loading…</div>
        ) : items.length === 0 ? (
          <div className="empty">No items yet.</div>
        ) : (
          <table>
            <thead>
              <tr><th style={{ width: 56 }} /><th>Item</th><th style={{ width: 140 }}>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e._id}>
                  <td>
                    {e.photo ? (
                      <img
                        src={img(e.photo, isDirectory ? 'avatar' : 'thumb')}
                        alt=""
                        style={{ width: 40, height: 40, borderRadius: isDirectory ? '50%' : 8, objectFit: 'cover' }}
                      />
                    ) : null}
                  </td>
                  <td>
                    <strong>{e.title}</strong>
                    {e.subtitle && <div className="muted">{e.subtitle}</div>}
                    {e.phone && <div className="muted" style={{ fontSize: 12 }}>{e.phone}</div>}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn-link" onClick={() => openEdit(e)}>Edit</button>
                      <button className="btn-link danger" onClick={() => remove(e)}>Delete</button>
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
          title={editing ? `Edit · ${editing.title}` : 'Add item'}
          onClose={() => { setEditing(null); setCreating(false); }}
          footer={
            <>
              <button className="btn secondary" onClick={() => { setEditing(null); setCreating(false); }}>Cancel</button>
              <button className="btn" onClick={save} disabled={saving || !form.title.trim()}>{saving ? 'Saving…' : 'Save'}</button>
            </>
          }>
          {error && <div className="alert error">{error}</div>}
          <Field label={isDirectory ? 'Name' : 'Title'} required>
            <input value={form.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Subtitle">
            <input value={form.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
          </Field>
          <Field label={isDirectory ? 'Photo' : 'Image'}>
            <ImageUpload value={form.photo} onChange={(url) => set({ photo: url })} shape={isDirectory ? 'avatar' : 'banner'} />
          </Field>
          {isDirectory ? (
            <div className="field-row">
              <Field label="Phone">
                <input value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
              </Field>
              <Field label="WhatsApp">
                <input value={form.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} />
              </Field>
            </div>
          ) : (
            <Field label="Link (optional)">
              <input value={form.link} onChange={(e) => set({ link: e.target.value })} placeholder="https://…" />
            </Field>
          )}
          <Field label="Description">
            <textarea rows={2} value={form.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
        </Modal>
      )}
    </div>
  );
}
