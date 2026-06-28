import { CrudPage } from '../components/CrudPage';
import { Field, Checkbox, Combobox } from '../components/fields';
import { ImageUpload } from '../components/ImageUpload';
import { providerApi } from '../api/resources';
import { SERVICE_CATEGORIES, labelFor } from '../constants';
import type { ServiceProvider } from '../types';

interface Form {
  name: string;
  nameMl: string;
  category: string;
  phone: string;
  whatsapp: string;
  photo: string;
  experienceYears: string;
  description: string;
  isVerified: boolean;
}

const blank: Form = {
  name: '',
  nameMl: '',
  category: '',
  phone: '',
  whatsapp: '',
  photo: '',
  experienceYears: '0',
  description: '',
  isVerified: false,
};

export function ServiceProviders() {
  return (
    <CrudPage<ServiceProvider, Form>
      noun="Service Provider"
      paginated
      requireVillage
      secondaryFilter={{
        key: 'category',
        placeholder: 'All categories',
        options: SERVICE_CATEGORIES,
      }}
      list={providerApi.list}
      create={providerApi.create}
      update={providerApi.update}
      remove={providerApi.remove}
      columns={[
        {
          header: 'Name',
          render: (p) => (
            <div>
              <strong>{p.name}</strong>
              {p.nameMl && <div className="muted">{p.nameMl}</div>}
            </div>
          ),
        },
        { header: 'Category', render: (p) => labelFor(SERVICE_CATEGORIES, p.category) },
        { header: 'Phone', render: (p) => p.phone },
        { header: 'Experience', render: (p) => `${p.experienceYears} yrs` },
        {
          header: 'Status',
          render: (p) =>
            p.isVerified ? (
              <span className="badge green">Verified</span>
            ) : (
              <span className="badge gray">Unverified</span>
            ),
        },
      ]}
      blankForm={blank}
      toForm={(p) => ({
        name: p.name,
        nameMl: p.nameMl ?? '',
        category: p.category,
        phone: p.phone,
        whatsapp: p.whatsapp ?? '',
        photo: p.photo ?? '',
        experienceYears: String(p.experienceYears),
        description: p.description ?? '',
        isVerified: p.isVerified,
      })}
      toPayload={(f, scope) => ({
        name: f.name,
        nameMl: f.nameMl || undefined,
        category: f.category.trim().toLowerCase(),
        phone: f.phone,
        whatsapp: f.whatsapp || undefined,
        photo: f.photo || undefined,
        experienceYears: Number(f.experienceYears) || 0,
        description: f.description || undefined,
        isVerified: f.isVerified,
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
          <div className="field-row">
            <Field label="Category" required>
              <Combobox
                value={f.category}
                onChange={(v) => set({ category: v })}
                suggestions={SERVICE_CATEGORIES}
                placeholder="Select or type a category"
              />
            </Field>
            <Field label="Experience (years)">
              <input
                type="number"
                min={0}
                value={f.experienceYears}
                onChange={(e) => set({ experienceYears: e.target.value })}
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
          <Field label="Photo (person / service)">
            <ImageUpload value={f.photo} onChange={(url) => set({ photo: url })} shape="avatar" />
          </Field>
          <Field label="Description">
            <textarea
              rows={2}
              value={f.description}
              onChange={(e) => set({ description: e.target.value })}
            />
          </Field>
          <Checkbox
            label="Verified"
            checked={f.isVerified}
            onChange={(v) => set({ isVerified: v })}
          />
        </>
      )}
    />
  );
}
