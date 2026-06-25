import { CrudPage } from '../components/CrudPage';
import { Field, Checkbox } from '../components/fields';
import { announcementApi } from '../api/resources';
import { ANNOUNCEMENT_TYPES, labelFor } from '../constants';
import type { Announcement } from '../types';

interface Form {
  title: string;
  titleMl: string;
  body: string;
  bodyMl: string;
  type: string;
  isPinned: boolean;
  expiresAt: string;
}

const blank: Form = {
  title: '',
  titleMl: '',
  body: '',
  bodyMl: '',
  type: 'general',
  isPinned: false,
  expiresAt: '',
};

export function Announcements() {
  return (
    <CrudPage<Announcement, Form>
      noun="Announcement"
      paginated
      requireVillage
      secondaryFilter={{
        key: 'type',
        placeholder: 'All types',
        options: ANNOUNCEMENT_TYPES,
      }}
      list={announcementApi.list}
      create={announcementApi.create}
      update={announcementApi.update}
      remove={announcementApi.remove}
      columns={[
        {
          header: 'Title',
          render: (a) => (
            <div>
              <strong>{a.isPinned ? '📌 ' : ''}{a.title}</strong>
              {a.titleMl && <div className="muted">{a.titleMl}</div>}
            </div>
          ),
        },
        { header: 'Type', render: (a) => labelFor(ANNOUNCEMENT_TYPES, a.type) },
        {
          header: 'Expires',
          render: (a) =>
            a.expiresAt ? new Date(a.expiresAt).toLocaleDateString() : '—',
        },
        {
          header: 'Created',
          render: (a) => new Date(a.createdAt).toLocaleDateString(),
        },
      ]}
      blankForm={blank}
      toForm={(a) => ({
        title: a.title,
        titleMl: a.titleMl ?? '',
        body: a.body,
        bodyMl: a.bodyMl ?? '',
        type: a.type,
        isPinned: a.isPinned,
        expiresAt: a.expiresAt ? a.expiresAt.slice(0, 10) : '',
      })}
      toPayload={(f, scope) => ({
        title: f.title,
        titleMl: f.titleMl || undefined,
        body: f.body,
        bodyMl: f.bodyMl || undefined,
        type: f.type,
        isPinned: f.isPinned,
        expiresAt: f.expiresAt || undefined,
        village: scope.villageId,
      })}
      renderForm={(f, set) => (
        <>
          <div className="field-row">
            <Field label="Title" required>
              <input value={f.title} onChange={(e) => set({ title: e.target.value })} />
            </Field>
            <Field label="Title (Malayalam)">
              <input value={f.titleMl} onChange={(e) => set({ titleMl: e.target.value })} />
            </Field>
          </div>
          <Field label="Body" required>
            <textarea
              rows={3}
              value={f.body}
              onChange={(e) => set({ body: e.target.value })}
            />
          </Field>
          <Field label="Body (Malayalam)">
            <textarea
              rows={3}
              value={f.bodyMl}
              onChange={(e) => set({ bodyMl: e.target.value })}
            />
          </Field>
          <div className="field-row">
            <Field label="Type">
              <select value={f.type} onChange={(e) => set({ type: e.target.value })}>
                {ANNOUNCEMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Expires on">
              <input
                type="date"
                value={f.expiresAt}
                onChange={(e) => set({ expiresAt: e.target.value })}
              />
            </Field>
          </div>
          <Checkbox
            label="Pin to top"
            checked={f.isPinned}
            onChange={(v) => set({ isPinned: v })}
          />
        </>
      )}
    />
  );
}
