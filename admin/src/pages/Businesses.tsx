import { CrudPage } from '../components/CrudPage';
import { Field, Checkbox, Combobox } from '../components/fields';
import { ImageUpload } from '../components/ImageUpload';
import { MapPicker } from '../components/MapPicker';
import { businessApi } from '../api/resources';
import { BUSINESS_CATEGORIES, labelFor } from '../constants';
import type { Business } from '../types';

interface Form {
  name: string;
  nameMl: string;
  category: string;
  phone: string;
  whatsapp: string;
  acceptsOrders: boolean;
  address: string;
  workingHours: string;
  photos: string; // one URL per line
  description: string;
  lat: number | null;
  lng: number | null;
  isVerified: boolean;
  isFeatured: boolean;
}

const blank: Form = {
  name: '',
  nameMl: '',
  category: '',
  phone: '',
  whatsapp: '',
  acceptsOrders: false,
  address: '',
  workingHours: '',
  photos: '',
  description: '',
  lat: null,
  lng: null,
  isVerified: false,
  isFeatured: false,
};

const linesToArr = (s: string) =>
  s.split('\n').map((l) => l.trim()).filter(Boolean);

export function Businesses() {
  return (
    <CrudPage<Business, Form>
      noun="Business"
      paginated
      requireVillage
      secondaryFilter={{
        key: 'category',
        placeholder: 'All categories',
        options: BUSINESS_CATEGORIES,
      }}
      list={businessApi.list}
      create={businessApi.create}
      update={businessApi.update}
      remove={businessApi.remove}
      columns={[
        {
          header: 'Name',
          render: (b) => (
            <div>
              <strong>{b.name}</strong>
              {b.nameMl && <div className="muted">{b.nameMl}</div>}
            </div>
          ),
        },
        { header: 'Category', render: (b) => labelFor(BUSINESS_CATEGORIES, b.category) },
        { header: 'Phone', render: (b) => b.phone },
        {
          header: 'Status',
          render: (b) => (
            <>
              {b.isVerified && <span className="badge green">Verified</span>}{' '}
              {b.isFeatured && <span className="badge amber">Featured</span>}{' '}
              {b.acceptsOrders && <span className="badge green">Orders</span>}
              {!b.isVerified && !b.isFeatured && !b.acceptsOrders && (
                <span className="badge gray">—</span>
              )}
            </>
          ),
        },
        {
          header: 'Rating',
          render: (b) => (b.ratingCount ? `${b.ratingAverage} (${b.ratingCount})` : '—'),
        },
      ]}
      blankForm={blank}
      toForm={(b) => ({
        name: b.name,
        nameMl: b.nameMl ?? '',
        category: b.category,
        phone: b.phone,
        whatsapp: b.whatsapp ?? '',
        acceptsOrders: b.acceptsOrders ?? false,
        address: b.address,
        workingHours: b.workingHours ?? '',
        photos: (b.photos ?? []).join('\n'),
        description: b.description ?? '',
        lat: b.location?.coordinates ? b.location.coordinates[1] : null,
        lng: b.location?.coordinates ? b.location.coordinates[0] : null,
        isVerified: b.isVerified,
        isFeatured: b.isFeatured,
      })}
      toPayload={(f, scope) => ({
        name: f.name,
        nameMl: f.nameMl || undefined,
        category: f.category.trim().toLowerCase(),
        phone: f.phone,
        whatsapp: f.whatsapp || undefined,
        acceptsOrders: f.acceptsOrders,
        address: f.address,
        workingHours: f.workingHours || undefined,
        photos: linesToArr(f.photos),
        description: f.description || undefined,
        coordinates: f.lat != null && f.lng != null ? [f.lng, f.lat] : undefined,
        isVerified: f.isVerified,
        isFeatured: f.isFeatured,
        village: scope.villageId,
      })}
      renderForm={(f, set) => (
        <>
          <div className="field-row">
            <Field label="Name" required>
              <input value={f.name} onChange={(e) => set({ name: e.target.value })} />
            </Field>
            <Field label="Name (Malayalam)">
              <input value={f.nameMl} onChange={(e) => set({ nameMl: e.target.value })} />
            </Field>
          </div>
          <Field label="Category" required>
            <Combobox
              value={f.category}
              onChange={(v) => set({ category: v })}
              suggestions={BUSINESS_CATEGORIES}
              placeholder="Select or type a category"
            />
          </Field>
          <div className="field-row">
            <Field label="Phone" required>
              <input value={f.phone} onChange={(e) => set({ phone: e.target.value })} />
            </Field>
            <Field label="WhatsApp (for orders)">
              <input value={f.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} />
            </Field>
          </div>
          <Field label="Address" required>
            <input value={f.address} onChange={(e) => set({ address: e.target.value })} />
          </Field>
          <Field label="Location on map">
            <MapPicker lat={f.lat} lng={f.lng} onChange={(lat, lng) => set({ lat, lng })} />
            <div
              style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
              <span className="muted" style={{ fontSize: 12 }}>
                {f.lat != null && f.lng != null
                  ? `📍 ${f.lat.toFixed(5)}, ${f.lng.toFixed(5)}`
                  : 'Tap the map to drop a pin (or use your location).'}
              </span>
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  if (!navigator.geolocation) return;
                  navigator.geolocation.getCurrentPosition(
                    (pos) => set({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    () => undefined
                  );
                }}>
                Use my location
              </button>
              {f.lat != null && (
                <button type="button" className="btn-link danger" onClick={() => set({ lat: null, lng: null })}>
                  Clear pin
                </button>
              )}
            </div>
          </Field>
          <Field label="Working hours">
            <input
              value={f.workingHours}
              onChange={(e) => set({ workingHours: e.target.value })}
              placeholder="e.g. Mon–Sat 9 AM – 8 PM"
            />
          </Field>
          <Field label="Photos">
            <ImageUpload
              value=""
              onChange={(url) => set({ photos: (f.photos ? f.photos + '\n' : '') + url })}
              shape="banner"
            />
            {f.photos.trim() ? (
              <textarea
                rows={3}
                value={f.photos}
                onChange={(e) => set({ photos: e.target.value })}
                style={{ marginTop: 8 }}
              />
            ) : null}
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              Upload one or more photos. The first is used as the cover.
            </div>
          </Field>
          <Field label="Description">
            <textarea
              rows={2}
              value={f.description}
              onChange={(e) => set({ description: e.target.value })}
            />
          </Field>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <Checkbox label="Verified" checked={f.isVerified} onChange={(v) => set({ isVerified: v })} />
            <Checkbox label="Featured" checked={f.isFeatured} onChange={(v) => set({ isFeatured: v })} />
            <Checkbox
              label="Accepts WhatsApp orders"
              checked={f.acceptsOrders}
              onChange={(v) => set({ acceptsOrders: v })}
            />
          </div>
        </>
      )}
    />
  );
}
