import { useEffect, useState } from 'react';
import {
  announcementApi,
  businessApi,
  deviceApi,
  emergencyApi,
  providerApi,
} from '../api/resources';
import { useAuth } from '../auth/AuthContext';
import { useLocationScope } from '../location/LocationContext';
import { ROLES } from '../types';

interface Stats {
  businesses: number;
  providers: number;
  emergency: number;
  announcements: number;
}

interface UserStats {
  total: number;
  villages: { village: string; name: string; count: number }[];
}

export function Dashboard() {
  const { user } = useAuth();
  const isSuper = user?.role === ROLES.SUPER_ADMIN;
  const { districtId, blockId, villageId, districts, blocks, villages } =
    useLocationScope();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserStats | null>(null);

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

  // Unique app users per village (super admin only).
  useEffect(() => {
    if (!isSuper) return;
    deviceApi
      .stats(districtId || undefined)
      .then((r) => setUsers(r.data))
      .catch(() => setUsers(null));
  }, [isSuper, districtId]);

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
    ...(isSuper ? [{ label: 'Unique app users', value: users?.total }] : []),
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

      {isSuper && (
        <div className="card table-wrap" style={{ marginBottom: 16 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0 }}>
              Unique app users per village{' '}
              <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>· {districtName}</span>
            </h3>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              Counts each app install once (residents don’t log in).
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Village</th>
                <th style={{ width: 140 }}>Unique users</th>
              </tr>
            </thead>
            <tbody>
              {!users || users.villages.length === 0 ? (
                <tr>
                  <td colSpan={2} className="empty">No app users recorded yet.</td>
                </tr>
              ) : (
                users.villages.map((v) => (
                  <tr key={v.village}>
                    <td>{v.name}</td>
                    <td>
                      <strong>{v.count}</strong>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ marginTop: 0 }}>Welcome to the OneVillage admin console</h3>
        <p className="muted">
          Use the locality selectors in the top bar to switch districts and blocks.
          All listings below are scoped to the selected location. Manage businesses,
          service providers, emergency contacts and announcements from the sidebar.
        </p>
      </div>
    </div>
  );
}
