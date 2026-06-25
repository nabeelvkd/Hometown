import { useEffect, useState } from 'react';
import { Modal } from '../components/Modal';
import { Field } from '../components/fields';
import { locationApi, userApi } from '../api/resources';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { useLocationScope } from '../location/LocationContext';
import { ROLES, type AdminUser } from '../types';

const MODAL_TITLE: Record<string, string> = {
  district: 'Add District',
  block: 'Add Area',
  village: 'Add Village',
};

type ModalKind = 'district' | 'block' | 'village' | null;

function villageIdOf(admin: AdminUser): string {
  return typeof admin.village === 'object' ? admin.village?._id ?? '' : admin.village ?? '';
}

export function Locations() {
  const { user } = useAuth();
  const {
    districts,
    blocks,
    villages,
    districtId,
    blockId,
    setDistrictId,
    setBlockId,
    reloadDistricts,
    reloadBlocks,
    reloadVillages,
  } = useLocationScope();

  const [modal, setModal] = useState<ModalKind>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // location form fields
  const [name, setName] = useState('');
  const [nameMl, setNameMl] = useState('');
  const [code, setCode] = useState('');

  // local-admin management
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminVillage, setAdminVillage] = useState<{ id: string; name: string } | null>(null);
  const [aName, setAName] = useState('');
  const [aPhone, setAPhone] = useState('');
  const [aPassword, setAPassword] = useState('');
  const [manage, setManage] = useState<AdminUser | null>(null);
  const [resetPwd, setResetPwd] = useState('');

  const loadAdmins = () => {
    userApi
      .listAdmins()
      .then((res) => setAdmins(res.data))
      .catch(() => setAdmins([]));
  };
  useEffect(loadAdmins, []);

  if (user?.role !== ROLES.SUPER_ADMIN) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ marginTop: 0 }}>Locations</h3>
        <p className="muted">Only the super admin can manage the location hierarchy.</p>
      </div>
    );
  }

  const open = (kind: Exclude<ModalKind, null>) => {
    setName('');
    setNameMl('');
    setCode('');
    setError(null);
    setModal(kind);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      if (modal === 'district') {
        await locationApi.createDistrict({ name, nameMl: nameMl || undefined, code: code || undefined });
        reloadDistricts();
      } else if (modal === 'block') {
        await locationApi.createBlock({ name, nameMl: nameMl || undefined, district: districtId });
        reloadBlocks();
      } else if (modal === 'village') {
        await locationApi.createVillage({ name, nameMl: nameMl || undefined, block: blockId });
        reloadVillages();
      }
      setModal(null);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  const openAdmin = (villageId: string, villageName: string) => {
    setAdminVillage({ id: villageId, name: villageName });
    setAName('');
    setAPhone('');
    setAPassword('');
    setError(null);
  };

  const saveAdmin = async () => {
    if (!adminVillage) return;
    setSaving(true);
    setError(null);
    try {
      await userApi.createLocalAdmin({
        name: aName,
        phone: aPhone,
        password: aPassword,
        village: adminVillage.id,
      });
      setAdminVillage(null);
      loadAdmins();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  const openManage = (admin: AdminUser) => {
    setManage(admin);
    setResetPwd('');
    setError(null);
  };

  const resetPassword = async () => {
    if (!manage || resetPwd.length < 6) return;
    setSaving(true);
    setError(null);
    try {
      await userApi.updateLocalAdmin(manage.id, { password: resetPwd });
      setManage(null);
      setResetPwd('');
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleDisabled = async () => {
    if (!manage) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await userApi.updateLocalAdmin(manage.id, { isActive: !manage.isActive });
      setManage(updated.data);
      loadAdmins();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  const adminForVillage = (vid: string) =>
    admins.find((a) => a.role === ROLES.LOCAL_ADMIN && villageIdOf(a) === vid);

  const districtName = districts.find((d) => d._id === districtId)?.name ?? '—';
  const blockName = blocks.find((b) => b._id === blockId)?.name ?? '—';

  return (
    <div className="hier-grid">
      {/* Districts */}
      <div>
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>Districts</h3>
          <button className="btn sm" onClick={() => open('district')}>+ Add</button>
        </div>
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Name</th><th style={{ width: 80 }} /></tr></thead>
            <tbody>
              {districts.map((d) => (
                <tr key={d._id} style={{ background: d._id === districtId ? 'var(--primary-soft)' : undefined }}>
                  <td>
                    <strong>{d.name}</strong>
                    {d.nameMl && <div className="muted">{d.nameMl}</div>}
                  </td>
                  <td>
                    <button className="btn-link" onClick={() => setDistrictId(d._id)} disabled={d._id === districtId}>
                      {d._id === districtId ? '✓' : 'Open'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Areas */}
      <div>
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>
            Areas <span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>· {districtName}</span>
          </h3>
          <button className="btn sm" onClick={() => open('block')} disabled={!districtId}>+ Add</button>
        </div>
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Name</th><th style={{ width: 60 }} /></tr></thead>
            <tbody>
              {blocks.length === 0 ? (
                <tr><td colSpan={2} className="empty">No areas yet.</td></tr>
              ) : (
                blocks.map((b) => (
                  <tr key={b._id} style={{ background: b._id === blockId ? 'var(--primary-soft)' : undefined }}>
                    <td>
                      <strong>{b.name}</strong>
                      {b.nameMl && <div className="muted">{b.nameMl}</div>}
                    </td>
                    <td>
                      <button className="btn-link" onClick={() => setBlockId(b._id)} disabled={b._id === blockId}>
                        {b._id === blockId ? '✓' : 'Open'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Villages + their local admin */}
      <div>
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>
            Villages <span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>· {blockName}</span>
          </h3>
          <button className="btn sm" onClick={() => open('village')} disabled={!blockId}>+ Add</button>
        </div>
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Village</th><th>Local Admin</th></tr></thead>
            <tbody>
              {villages.length === 0 ? (
                <tr><td colSpan={2} className="empty">No villages yet.</td></tr>
              ) : (
                villages.map((v) => {
                  const admin = adminForVillage(v._id);
                  return (
                    <tr key={v._id}>
                      <td>
                        <strong>{v.name}</strong>
                        {v.nameMl && <div className="muted">{v.nameMl}</div>}
                      </td>
                      <td>
                        {admin ? (
                          <div>
                            <span className={`badge ${admin.isActive ? 'green' : 'gray'}`}>
                              {admin.name}
                              {admin.isActive ? '' : ' · disabled'}
                            </span>
                            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{admin.phone}</div>
                            <button className="btn-link" style={{ paddingLeft: 0 }} onClick={() => openManage(admin)}>
                              Manage
                            </button>
                          </div>
                        ) : (
                          <button className="btn sm" onClick={() => openAdmin(v._id, v.name)}>
                            + Create admin
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add location modal */}
      {modal && (
        <Modal
          title={MODAL_TITLE[modal]}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </>
          }
        >
          {error && <div className="alert error">{error}</div>}
          <Field label="Name" required>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Name (Malayalam)">
            <input value={nameMl} onChange={(e) => setNameMl(e.target.value)} />
          </Field>
          {modal === 'district' && (
            <Field label="Code">
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="KKD" />
            </Field>
          )}
        </Modal>
      )}

      {/* Create local admin modal */}
      {adminVillage && (
        <Modal
          title={`Create Local Admin · ${adminVillage.name}`}
          onClose={() => setAdminVillage(null)}
          footer={
            <>
              <button className="btn secondary" onClick={() => setAdminVillage(null)}>Cancel</button>
              <button className="btn" onClick={saveAdmin} disabled={saving}>
                {saving ? 'Creating…' : 'Create login'}
              </button>
            </>
          }
        >
          {error && <div className="alert error">{error}</div>}
          <p className="muted" style={{ marginTop: 0 }}>
            This admin will manage <strong>only {adminVillage.name}</strong>. One village = one local admin.
          </p>
          <Field label="Admin name" required>
            <input value={aName} onChange={(e) => setAName(e.target.value)} placeholder="e.g. Omassery Admin" />
          </Field>
          <Field label="Phone (login)" required>
            <input value={aPhone} onChange={(e) => setAPhone(e.target.value)} placeholder="+91XXXXXXXXXX" />
          </Field>
          <Field label="Password" required>
            <input type="password" value={aPassword} onChange={(e) => setAPassword(e.target.value)} placeholder="min 6 characters" />
          </Field>
        </Modal>
      )}

      {/* Manage existing local admin */}
      {manage && (
        <Modal
          title={`Manage admin · ${manage.name}`}
          onClose={() => setManage(null)}
          footer={
            <button className="btn secondary" onClick={() => setManage(null)}>
              Close
            </button>
          }
        >
          {error && <div className="alert error">{error}</div>}
          <p className="muted" style={{ marginTop: 0 }}>
            {manage.phone} ·{' '}
            <strong style={{ color: manage.isActive ? 'var(--success)' : 'var(--danger)' }}>
              {manage.isActive ? 'Active' : 'Disabled'}
            </strong>
          </p>

          <Field label="Reset password">
            <input
              type="password"
              value={resetPwd}
              onChange={(e) => setResetPwd(e.target.value)}
              placeholder="New password (min 6 characters)"
            />
          </Field>
          <button className="btn" onClick={resetPassword} disabled={saving || resetPwd.length < 6}>
            {saving ? 'Saving…' : 'Reset password'}
          </button>

          <hr style={{ margin: '20px 0', border: 0, borderTop: '1px solid var(--border)' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong>{manage.isActive ? 'Disable login' : 'Enable login'}</strong>
              <div className="muted" style={{ fontSize: 13 }}>
                {manage.isActive
                  ? 'The admin will no longer be able to sign in.'
                  : 'Restore this admin’s access.'}
              </div>
            </div>
            <button
              className={`btn ${manage.isActive ? 'danger' : ''}`}
              onClick={toggleDisabled}
              disabled={saving}>
              {manage.isActive ? 'Disable' : 'Enable'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
