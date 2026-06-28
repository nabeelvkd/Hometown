import { CrudPage } from '../components/CrudPage';
import { Field, Checkbox, Combobox } from '../components/fields';
import { ImageUpload } from '../components/ImageUpload';
import { taxiApi } from '../api/resources';
import { VEHICLE_TYPES, labelFor } from '../constants';
import type { Taxi } from '../types';

interface Form {
  driverName: string;
  photo: string;
  phone: string;
  whatsapp: string;
  vehicleType: string;
  vehicleNumber: string;
  seats: string;
  description: string;
  available: boolean;
  isVerified: boolean;
}

const blank: Form = {
  driverName: '',
  photo: '',
  phone: '',
  whatsapp: '',
  vehicleType: 'auto',
  vehicleNumber: '',
  seats: '',
  description: '',
  available: true,
  isVerified: false,
};

export function Taxis() {
  return (
    <CrudPage<Taxi, Form>
      noun="Taxi"
      paginated
      requireVillage
      secondaryFilter={{ key: 'vehicleType', placeholder: 'All vehicles', options: VEHICLE_TYPES }}
      list={taxiApi.list}
      create={taxiApi.create}
      update={taxiApi.update}
      remove={taxiApi.remove}
      columns={[
        {
          header: 'Driver',
          render: (t) => (
            <div>
              <strong>{t.driverName}</strong>
              <div className="muted">{t.phone}</div>
            </div>
          ),
        },
        { header: 'Vehicle', render: (t) => labelFor(VEHICLE_TYPES, t.vehicleType) },
        { header: 'Number', render: (t) => t.vehicleNumber },
        {
          header: 'Status',
          render: (t) => (
            <>
              {t.isVerified && <span className="badge green">Verified</span>}{' '}
              {t.available ? <span className="badge green">Available</span> : <span className="badge gray">Off</span>}
            </>
          ),
        },
      ]}
      blankForm={blank}
      toForm={(t) => ({
        driverName: t.driverName,
        photo: t.photo ?? '',
        phone: t.phone,
        whatsapp: t.whatsapp ?? '',
        vehicleType: t.vehicleType,
        vehicleNumber: t.vehicleNumber,
        seats: t.seats ? String(t.seats) : '',
        description: t.description ?? '',
        available: t.available ?? true,
        isVerified: t.isVerified,
      })}
      toPayload={(f, scope) => ({
        driverName: f.driverName,
        photo: f.photo || undefined,
        phone: f.phone,
        whatsapp: f.whatsapp || undefined,
        vehicleType: f.vehicleType.trim().toLowerCase(),
        vehicleNumber: f.vehicleNumber,
        seats: f.seats ? Number(f.seats) : undefined,
        description: f.description || undefined,
        available: f.available,
        isVerified: f.isVerified,
        village: scope.villageId,
      })}
      renderForm={(f, set) => (
        <>
          <div className="field-row">
            <Field label="Driver name" required>
              <input value={f.driverName} onChange={(e) => set({ driverName: e.target.value })} />
            </Field>
            <Field label="Vehicle type" required>
              <Combobox
                value={f.vehicleType}
                onChange={(v) => set({ vehicleType: v })}
                suggestions={VEHICLE_TYPES}
                placeholder="auto / car / jeep…"
              />
            </Field>
          </div>
          <div className="field-row">
            <Field label="Vehicle number" required>
              <input
                value={f.vehicleNumber}
                onChange={(e) => set({ vehicleNumber: e.target.value })}
                placeholder="KL11AB1234"
              />
            </Field>
            <Field label="Seats">
              <input
                type="number"
                min={1}
                value={f.seats}
                onChange={(e) => set({ seats: e.target.value })}
              />
            </Field>
          </div>
          <div className="field-row">
            <Field label="Phone" required>
              <input value={f.phone} onChange={(e) => set({ phone: e.target.value })} />
            </Field>
            <Field label="WhatsApp">
              <input value={f.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} />
            </Field>
          </div>
          <Field label="Driver photo">
            <ImageUpload value={f.photo} onChange={(url) => set({ photo: url })} shape="avatar" />
          </Field>
          <Field label="Description">
            <textarea rows={2} value={f.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
          <div style={{ display: 'flex', gap: 24 }}>
            <Checkbox label="Available" checked={f.available} onChange={(v) => set({ available: v })} />
            <Checkbox label="Verified" checked={f.isVerified} onChange={(v) => set({ isVerified: v })} />
          </div>
        </>
      )}
    />
  );
}
