import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Modal } from './Modal';
import { Select } from './fields';
import { ApiError, type Result } from '../api/client';
import { useLocationScope } from '../location/LocationContext';

export interface Column<T> {
  header: string;
  render: (item: T) => ReactNode;
}

interface SecondaryFilter {
  key: string;
  placeholder: string;
  options: { value: string; label: string }[];
}

export interface CrudConfig<T extends { _id: string }, F> {
  /** Singular noun, e.g. "Business" — used in buttons and the modal title. */
  noun: string;
  columns: Column<T>[];
  list: (query: Record<string, string | number | undefined>) => Promise<Result<T[]>>;
  create: (body: Partial<T>) => Promise<Result<T>>;
  update: (id: string, body: Partial<T>) => Promise<Result<T>>;
  remove: (id: string) => Promise<Result<{ id: string }>>;
  blankForm: F;
  toForm: (item: T) => F;
  toPayload: (
    form: F,
    scope: { districtId: string; blockId: string; villageId: string }
  ) => Partial<T>;
  renderForm: (form: F, set: (patch: Partial<F>) => void) => ReactNode;
  paginated?: boolean;
  /** Optional dropdown filter (category / type). */
  secondaryFilter?: SecondaryFilter;
  /** Require a village to be selected before creating (location-scoped). */
  requireVillage?: boolean;
}

export function CrudPage<T extends { _id: string }, F>(config: CrudConfig<T, F>) {
  const { districtId, blockId, villageId } = useLocationScope();

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterValue, setFilterValue] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<F>(config.blankForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!districtId) return;
    setLoading(true);
    setError(null);
    const query: Record<string, string | number | undefined> = {
      district: districtId,
      block: blockId || undefined,
      village: villageId || undefined,
      page: config.paginated ? page : undefined,
      limit: config.paginated ? 20 : undefined,
      q: search || undefined,
    };
    if (config.secondaryFilter && filterValue) {
      query[config.secondaryFilter.key] = filterValue;
    }
    config
      .list(query)
      .then((res) => {
        setItems(res.data);
        setTotalPages(res.meta?.totalPages ?? 1);
      })
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtId, blockId, villageId, page, filterValue, search]);

  useEffect(load, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(config.blankForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (item: T) => {
    setEditing(item);
    setForm(config.toForm(item));
    setFormError(null);
    setModalOpen(true);
  };

  const set = (patch: Partial<F>) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    setSaving(true);
    setFormError(null);
    try {
      const payload = config.toPayload(form, { districtId, blockId, villageId });
      if (editing) await config.update(editing._id, payload);
      else await config.create(payload);
      setModalOpen(false);
      load();
    } catch (e) {
      const err = e as ApiError;
      const detailMsg =
        Array.isArray(err.details) && err.details.length
          ? (err.details as { path: string; message: string }[])
              .map((d) => `${d.path}: ${d.message}`)
              .join(', ')
          : '';
      setFormError(detailMsg ? `${err.message} — ${detailMsg}` : err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: T) => {
    if (!window.confirm(`Delete this ${config.noun.toLowerCase()}?`)) return;
    try {
      await config.remove(item._id);
      load();
    } catch (e) {
      setError((e as ApiError).message);
    }
  };

  const canCreate = !config.requireVillage || !!villageId;

  return (
    <div>
      <div className="toolbar">
        <div className="filters">
          <input
            placeholder="Search by name…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            style={{ width: 220 }}
          />
          {config.secondaryFilter && (
            <div style={{ width: 200 }}>
              <Select
                value={filterValue}
                onChange={(v) => {
                  setPage(1);
                  setFilterValue(v);
                }}
                options={config.secondaryFilter.options}
                placeholder={config.secondaryFilter.placeholder}
              />
            </div>
          )}
        </div>
        <button className="btn" onClick={openCreate} disabled={!canCreate}>
          + Add {config.noun}
        </button>
      </div>

      {config.requireVillage && !villageId && (
        <div className="alert" style={{ background: '#fdf3e2', color: 'var(--warning)' }}>
          Select a specific village in the top bar to add a new {config.noun.toLowerCase()}.
        </div>
      )}

      {error && <div className="alert error">{error}</div>}

      <div className="card table-wrap">
        {loading ? (
          <div className="loading">Loading…</div>
        ) : items.length === 0 ? (
          <div className="empty">No {config.noun.toLowerCase()}s found for this location.</div>
        ) : (
          <table>
            <thead>
              <tr>
                {config.columns.map((c) => (
                  <th key={c.header}>{c.header}</th>
                ))}
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  {config.columns.map((c) => (
                    <td key={c.header}>{c.render(item)}</td>
                  ))}
                  <td>
                    <div className="row-actions">
                      <button className="btn-link" onClick={() => openEdit(item)}>
                        Edit
                      </button>
                      <button className="btn-link danger" onClick={() => remove(item)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {config.paginated && totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn secondary sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>
            <span className="muted">
              Page {page} of {totalPages}
            </span>
            <button
              className="btn secondary sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal
          title={`${editing ? 'Edit' : 'Add'} ${config.noun}`}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button className="btn secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="btn" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          }
        >
          {formError && <div className="alert error">{formError}</div>}
          {config.renderForm(form, set)}
        </Modal>
      )}
    </div>
  );
}
