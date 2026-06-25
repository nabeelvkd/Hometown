import { useEffect, useState } from 'react';
import {
  announcementApi,
  businessApi,
  emergencyApi,
  providerApi,
} from '../api/resources';
import { useLocationScope } from '../location/LocationContext';

interface Stats {
  businesses: number;
  providers: number;
  emergency: number;
  announcements: number;
}

export function Dashboard() {
  const { districtId, blockId, villageId, districts, blocks, villages } =
    useLocationScope();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!districtId) return;
    setLoading(true);
    const scope = {
      district: districtId,
      block: blockId || undefined,
      village: villageId || undefined,
    };
    const query = { ...scope, limit: 1 };
    Promise.all([
      businessApi.list(query),
      providerApi.list(query),
      emergencyApi.list(scope),
      announcementApi.list(query),
    ])
      .then(([b, p, e, a]) => {
        setStats({
          businesses: b.meta?.total ?? b.data.length,
          providers: p.meta?.total ?? p.data.length,
          emergency: e.data.length,
          announcements: a.meta?.total ?? a.data.length,
        });
      })
      .finally(() => setLoading(false));
  }, [districtId, blockId, villageId]);

  const districtName = districts.find((d) => d._id === districtId)?.name ?? '—';
  const blockName = blockId ? blocks.find((b) => b._id === blockId)?.name ?? '—' : '—';
  const villageName = villageId
    ? villages.find((v) => v._id === villageId)?.name ?? '—'
    : 'All villages';

  const cards = [
    { label: 'Businesses', value: stats?.businesses },
    { label: 'Service Providers', value: stats?.providers },
    { label: 'Emergency Contacts', value: stats?.emergency },
    { label: 'Announcements', value: stats?.announcements },
  ];

  return (
    <div>
      <p className="muted" style={{ marginTop: 0 }}>
        Showing data for <strong>{districtName}</strong> · {blockName} ·{' '}
        <strong>{villageName}</strong>
      </p>
      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.label} className="card stat">
            <div className="label">{c.label}</div>
            <div className="value">{loading ? '…' : (c.value ?? 0)}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ marginTop: 0 }}>Welcome to the Nattile admin console</h3>
        <p className="muted">
          Use the locality selectors in the top bar to switch districts and blocks.
          All listings below are scoped to the selected location. Manage businesses,
          service providers, emergency contacts and announcements from the sidebar.
        </p>
      </div>
    </div>
  );
}
