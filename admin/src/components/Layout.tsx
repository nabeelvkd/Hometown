import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useLocationScope } from '../location/LocationContext';
import { ROLES } from '../types';

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/businesses', label: 'Businesses' },
  { to: '/service-providers', label: 'Service Providers' },
  { to: '/taxis', label: 'Taxis' },
  { to: '/bus-times', label: 'Bus Times' },
  { to: '/emergency-contacts', label: 'Emergency Contacts' },
  { to: '/announcements', label: 'Announcements' },
  { to: '/ads', label: 'Ads' },
  { to: '/categories', label: 'Home Categories' },
  { to: '/village', label: 'Village Image' },
  { to: '/locations', label: 'Locations', superAdminOnly: true },
  { to: '/app-update', label: 'App Update', superAdminOnly: true },
];

export function Layout() {
  const { user, logout } = useAuth();
  const {
    districts,
    blocks,
    villages,
    districtId,
    blockId,
    villageId,
    locked,
    setDistrictId,
    setBlockId,
    setVillageId,
  } = useLocationScope();

  const [menuOpen, setMenuOpen] = useState(false);
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;
  const nav = NAV.filter((item) => !item.superAdminOnly || isSuperAdmin);

  const villageName = villages.find((v) => v._id === villageId)?.name;
  const areaName = blocks.find((b) => b._id === blockId)?.name;
  const districtName = districts.find((d) => d._id === districtId)?.name;

  const Brand = (
    <div className="brand">
      One<span>Village</span>
    </div>
  );

  return (
    <div className="layout">
      {/* Mobile top header */}
      <div className="mobile-header">
        {Brand}
        <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          ☰
        </button>
      </div>

      {menuOpen && <div className="drawer-overlay" onClick={() => setMenuOpen(false)} />}

      <aside className={`sidebar${menuOpen ? ' open' : ''}`}>
        {Brand}
        <nav>
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMenuOpen(false)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user">{user?.name}</div>
          <div className="muted" style={{ marginBottom: 10 }}>
            {user?.role === ROLES.LOCAL_ADMIN ? 'Local Admin' : 'Super Admin'}
          </div>
          <button className="btn secondary sm" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <h1>Admin Console</h1>

          {locked ? (
            <div className="locality-pill">
              📍 {villageName ?? 'Your village'}
              <span className="muted">
                {' '}
                · {areaName ?? ''}
                {districtName ? `, ${districtName}` : ''}
              </span>
            </div>
          ) : (
            <div className="selectors" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <select value={districtId} onChange={(e) => setDistrictId(e.target.value)} style={{ width: 170 }}>
                {districts.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <select value={blockId} onChange={(e) => setBlockId(e.target.value)} style={{ width: 170 }}>
                <option value="">Select area</option>
                {blocks.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <select value={villageId} onChange={(e) => setVillageId(e.target.value)} style={{ width: 170 }}>
                <option value="">All villages</option>
                {villages.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
