import { CrudPage } from '../components/CrudPage';
import { Field } from '../components/fields';
import { emergencyApi } from '../api/resources';
import { EMERGENCY_TYPES, labelFor } from '../constants';
import type { EmergencyContact } from '../types';

interface Form {
  name: string;
  nameMl: string;
  type: string;
  phone: string;
  alternatePhone: string;
  address: string;
  order: string;
}

const blank: Form = {
  name: '',
  nameMl: '',
  type: 'police',
  phone: '',
  alternatePhone: '',
  address: '',
  order: '0',
};

export function EmergencyContacts() {
  return (
    <CrudPage<EmergencyContact, Form>
      noun="Emergency Contact"
      requireVillage
      secondaryFilter={{
        key: 'type',
        placeholder: 'All types',
        options: EMERGENCY_TYPES,
      }}
      list={emergencyApi.list}
      create={emergencyApi.create}
      update={emergencyApi.update}
      remove={emergencyApi.remove}
      columns={[
        { header: 'Type', render: (c) => labelFor(EMERGENCY_TYPES, c.type) },
        {
          header: 'Name',
          render: (c) => (
            <div>
              <strong>{c.name}</strong>
              {c.nameMl && <div className="muted">{c.nameMl}</div>}
            </div>
          ),
        },
        { header: 'Phone', render: (c) => c.phone },
        { header: 'Alternate', render: (c) => c.alternatePhone || '—' },
      ]}
      blankForm={blank}
      toForm={(c) => ({
        name: c.name,
        nameMl: c.nameMl ?? '',
        type: c.type,
        phone: c.phone,
        alternatePhone: c.alternatePhone ?? '',
        address: c.address ?? '',
        order: String(c.order ?? 0),
      })}
      toPayload={(f, scope) => ({
        name: f.name,
        nameMl: f.nameMl || undefined,
        type: f.type,
        phone: f.phone,
        alternatePhone: f.alternatePhone || undefined,
        address: f.address || undefined,
        order: Number(f.order) || 0,
        village: scope.villageId,
      })}
      renderForm={(f, set) => (
        <>
          <div className="field-row">
            <Field label="Type" required>
              <select value={f.type} onChange={(e) => set({ type: e.target.value })}>
                {EMERGENCY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Display order">
              <input
                type="number"
                value={f.order}
                onChange={(e) => set({ order: e.target.value })}
              />
            </Field>
          </div>
          <div className="field-row">
            <Field label="Name" required>
              <input value={f.name} onChange={(e) => set({ name: e.target.value })} />
            </Field>
            <Field label="Name (Malayalam)">
              <input value={f.nameMl} onChange={(e) => set({ nameMl: e.target.value })} />
            </Field>
          </div>
          <div className="field-row">
            <Field label="Phone" required>
              <input value={f.phone} onChange={(e) => set({ phone: e.target.value })} />
            </Field>
            <Field label="Alternate phone">
              <input
                value={f.alternatePhone}
                onChange={(e) => set({ alternatePhone: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Address">
            <input value={f.address} onChange={(e) => set({ address: e.target.value })} />
          </Field>
        </>
      )}
    />
  );
}
