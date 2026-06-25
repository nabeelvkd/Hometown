import { CrudPage } from '../components/CrudPage';
import { Field, Checkbox, Combobox } from '../components/fields';
import { busTripApi } from '../api/resources';
import { BUS_TAGS, BUS_DESTINATIONS, labelFor } from '../constants';
import type { BusTrip } from '../types';

interface Form {
  destination: string;
  time: string;
  operator: string;
  number: string;
  tags: string[];
}

const blank: Form = {
  destination: 'Kozhikode',
  time: '',
  operator: '',
  number: '',
  tags: [],
};

export function BusTimes() {
  return (
    <CrudPage<BusTrip, Form>
      noun="Bus Trip"
      paginated
      requireVillage
      secondaryFilter={{ key: 'destination', placeholder: 'All destinations', options: BUS_DESTINATIONS }}
      list={busTripApi.list}
      create={busTripApi.create}
      update={busTripApi.update}
      remove={busTripApi.remove}
      columns={[
        { header: 'Time', render: (t) => <strong>{t.time}</strong> },
        {
          header: 'Bus',
          render: (t) => (
            <div>
              <strong>{t.operator}</strong>
              <div className="muted">{t.number}</div>
            </div>
          ),
        },
        { header: 'To', render: (t) => t.destination },
        {
          header: 'Tags',
          render: (t) =>
            t.tags.length ? (
              t.tags.map((tag) => (
                <span key={tag} className="badge gray" style={{ marginRight: 4 }}>
                  {labelFor(BUS_TAGS, tag)}
                </span>
              ))
            ) : (
              <span className="muted">—</span>
            ),
        },
      ]}
      blankForm={blank}
      toForm={(t) => ({
        destination: t.destination,
        time: t.time,
        operator: t.operator,
        number: t.number,
        tags: t.tags ?? [],
      })}
      toPayload={(f, scope) => ({
        destination: f.destination.trim(),
        time: f.time.trim(),
        operator: f.operator.trim(),
        number: f.number.trim(),
        tags: f.tags,
        village: scope.villageId,
      })}
      renderForm={(f, set) => (
        <>
          <div className="field-row">
            <Field label="Destination" required>
              <Combobox
                value={f.destination}
                onChange={(v) => set({ destination: v })}
                suggestions={BUS_DESTINATIONS}
                placeholder="Kozhikode"
              />
            </Field>
            <Field label="Time (24h, HH:MM)" required>
              <input value={f.time} onChange={(e) => set({ time: e.target.value })} placeholder="06:35" />
            </Field>
          </div>
          <div className="field-row">
            <Field label="Operator / bus name" required>
              <input value={f.operator} onChange={(e) => set({ operator: e.target.value })} placeholder="KSRTC Fast Passenger" />
            </Field>
            <Field label="Bus number" required>
              <input value={f.number} onChange={(e) => set({ number: e.target.value })} placeholder="KL-15-A-1234" />
            </Field>
          </div>
          <Field label="Tags (for filtering)">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {BUS_TAGS.map((tag) => (
                <Checkbox
                  key={tag.value}
                  label={tag.label}
                  checked={f.tags.includes(tag.value)}
                  onChange={(on) =>
                    set({
                      tags: on
                        ? [...f.tags, tag.value]
                        : f.tags.filter((x) => x !== tag.value),
                    })
                  }
                />
              ))}
            </div>
          </Field>
        </>
      )}
    />
  );
}
