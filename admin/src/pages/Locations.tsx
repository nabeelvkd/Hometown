import { useEffect, useState } from 'react';
import { Modal } from '../components/Modal';
import { Field } from '../components/fields';
import { locationApi, userApi } from '../api/resources';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { useLocationScope } from '../location/LocationContext';
import { ROLES, type AdminUser, type Block } from '../types';

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

  // add-location form
  const [name, setName] = useState('');
  const [nameMl, setNameMl] = useState('');
  const [code, setCode] = useState('');

  // admins
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const loadAdmins = () =>
    userApi.listAdmins().then((r) => setAdmins(r.data)).catch(() => setAdmins([]));
  useEffect(() => {
    loadAdmins();
  }, []);

  // manage-admins modal (for a village)
  const [manageVillage, setManageVillage] = useState<{ id: string; name: string } | null>(null);
  const [aName, setAName] = useState('');
  const [aPhone, setAPhone] = useState('');
  const [aPassword, setAPassword] = useState('');

  // change-area modal
  const [moveVillage, setMoveVillage] = useState<{ id: string; name: string } | null>(null);
  const [moveDistrict, setMoveDistrict] = useState('');
  const [moveBlocks, setMoveBlocks] = useState<Block[]>([]);
  const [moveBlock, setMoveBlock] = useState('');

  useEffect(() => {
    if (!moveDistrict) return setMoveBlocks([]);
    locationApi.listBlocks(moveDistrict).then((r) => setMoveBlocks(r.data)).catch(() => setMoveBlocks([]));
  }, [moveDistrict]);

  if (user?.role !== ROLES.SUPER_ADMIN) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ marginTop: 0 }}>Locations</h3>
        <p className="muted">Only the super admin can manage the location hierarchy.</p>
      </div>
    );
  }

  const adminsForVillage = (vid: string) =>
    admins.filter((a) => a.role === ROLES.LOCAL_ADMIN && villageIdOf(a) === vid);

  const openAdd = (kind: Exclude<ModalKind, null>) => {
    setName('');
    setNameMl('');
    setCode('');
    setError(null);
    setModal(kind);
  };

  const saveLocation = async () => {
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

  // ---- admins ----
  const addAdmin = async () => {
    if (!manageVillage) return;
    setSaving(true);
    setError(null);
    try {
      await userApi.createLocalAdmin({
        name: aName,
        phone: aPhone,
        password: aPassword,
        village: manageVillage.id,
      });
      setAName('');
      setAPhone('');
      setAPassword('');
      await loadAdmins();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async (admin: AdminUser) => {
    const pw = window.prompt(`New password for ${admin.name} (min 6 characters)`);
    if (!pw) return;
    if (pw.length < 6) return setError('Password must be at least 6 characters.');
    setError(null);
    try {
      await userApi.updateLocalAdmin(admin.id, { password: pw });
      window.alert('Password updated.');
    } catch (e) {
      setError((e as ApiError).message);
    }
  };

  const toggleAdmin = async (admin: AdminUser) => {
    setError(null);
    try {
      await userApi.updateLocalAdmin(admin.id, { isActive: !admin.isActive });
      await loadAdmins();
    } catch (e) {
      setError((e as ApiError).message);
    }
  };

  // ---- change area ----
  const openMove = (vid: string, vname: string) => {
    setMoveVillage({ id: vid, name: vname });
    setMoveDistrict(districtId);
    setMoveBlock('');
    setError(null);
  };

  const saveMove = async () => {
    if (!moveVillage || !moveBlock) return;
    setSaving(true);
    setError(null);
    try {
      await locationApi.updateVillage(moveVillage.id, { block: moveBlock });
      setMoveVillage(null);
      reloadVillages();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  const manageList = manageVillage ? adminsForVillage(manageVillage.id) : [];

  return (
    <div>
      {/* Selector toolbar */}
      <div
        className="card"
        style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', padding: 14, marginBottom: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label className="muted" style={{ fontSize: 12 }}>District</label>
          <select value={districtId} onChange={(e) => setDistrictId(e.target.value)} style={{ width: 200 }}>
            {districts.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <button className="btn secondary sm" onClick={() => openAdd('district')}>+ District</button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label className="muted" style={{ fontSize: 12 }}>Area</label>
          <select value={blockId} onChange={(e) => setBlockId(e.target.value)} style={{ width: 200 }} disabled={!districtId}>
            <option value="">Select area</option>
            {blocks.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <button className="btn secondary sm" onClick={() => openAdd('block')} disabled={!districtId}>+ Area</button>

        <div style={{ marginLeft: 'auto' }}>
          <button className="btn" onClick={() => openAdd('village')} disabled={!blockId}>+ Add village</button>
        </div>
      </div>

      {error && !manageVillage && !moveVillage && !modal && <div className="alert error">{error}</div>}

      {/* Villages table */}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Village</th>
              <th>Local admins</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!blockId ? (
              <tr><td colSpan={3} className="empty">Select a district and area to see its villages.</td></tr>
            ) : villages.length === 0 ? (
              <tr><td colSpan={3} className="empty">No villages in this area yet.</td></tr>
            ) : (
              villages.map((v) => {
                const vAdmins = adminsForVillage(v._id);
                return (
                  <tr key={v._id}>
                    <td>
                      <strong>{v.name}</strong>
                      {v.nameMl && <div className="muted">{v.nameMl}</div>}
                    </td>
                    <td>
                      {vAdmins.length === 0 ? (
                        <span className="muted">None yet</span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {vAdmins.map((a) => (
                            <span key={a.id} className={`badge ${a.isActive ? 'green' : 'gray'}`}>
                              {a.name}
                              {a.isActive ? '' : ' · off'}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn-link" onClick={() => setManageVillage({ id: v._id, name: v.name })}>
                          Manage admins
                        </button>
                        <button className="btn-link" onClick={() => openMove(v._id, v.name)}>
                          Change area
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add location modal */}
      {modal && (
        <Modal
          title={MODAL_TITLE[modal]}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn" onClick={saveLocation} disabled={saving || !name.trim()}>
                {saving ? 'Saving…' : 'Save'}
              </button>
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

      {/* Manage admins modal (multiple per village) */}
      {manageVillage && (
        <Modal
          title={`Local admins · ${manageVillage.name}`}
          onClose={() => setManageVillage(null)}
          footer={<button className="btn secondary" onClick={() => setManageVillage(null)}>Close</button>}
        >
          {error && <div className="alert error">{error}</div>}

          {manageList.length === 0 ? (
            <p className="muted" style={{ marginTop: 0 }}>No local admins yet for this village.</p>
          ) : (
            <div className="card table-wrap" style={{ marginBottom: 16 }}>
              <table>
                <thead>
                  <tr><th>Admin</th><th style={{ width: 180 }} /></tr>
                </thead>
                <tbody>
                  {manageList.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <strong>{a.name}</strong>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {a.phone} · {a.isActive ? 'Active' : 'Disabled'}
                        </div>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="btn-link" onClick={() => resetPassword(a)}>Reset pw</button>
                          <button className="btn-link danger" onClick={() => toggleAdmin(a)}>
                            {a.isActive ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h4 style={{ margin: '4px 0 8px' }}>Add a local admin</h4>
          <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>
            A village can have multiple local admins — they all manage {manageVillage.name}.
          </p>
          <Field label="Admin name" required>
            <input value={aName} onChange={(e) => setAName(e.target.value)} placeholder="e.g. Omassery Admin" />
          </Field>
          <div className="field-row">
            <Field label="Phone (login)" required>
              <input value={aPhone} onChange={(e) => setAPhone(e.target.value)} placeholder="+91XXXXXXXXXX" />
            </Field>
            <Field label="Password" required>
              <input type="password" value={aPassword} onChange={(e) => setAPassword(e.target.value)} placeholder="min 6 characters" />
            </Field>
          </div>
          <button
            className="btn"
            onClick={addAdmin}
            disabled={saving || !aName.trim() || !aPhone.trim() || aPassword.length < 6}>
            {saving ? 'Creating…' : '+ Create admin login'}
          </button>
        </Modal>
      )}

      {/* Change area modal */}
      {moveVillage && (
        <Modal
          title={`Change area · ${moveVillage.name}`}
          onClose={() => setMoveVillage(null)}
          footer={
            <>
              <button className="btn secondary" onClick={() => setMoveVillage(null)}>Cancel</button>
              <button className="btn" onClick={saveMove} disabled={saving || !moveBlock}>
                {saving ? 'Moving…' : 'Move village'}
              </button>
            </>
          }
        >
          {error && <div className="alert error">{error}</div>}
          <p className="muted" style={{ marginTop: 0 }}>
            Move <strong>{moveVillage.name}</strong> to a different district/area. Its local admins move with it.
          </p>
          <Field label="District" required>
            <select value={moveDistrict} onChange={(e) => { setMoveDistrict(e.target.value); setMoveBlock(''); }}>
              <option value="">Select district</option>
              {districts.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Area" required>
            <select value={moveBlock} onChange={(e) => setMoveBlock(e.target.value)} disabled={!moveDistrict}>
              <option value="">Select area</option>
              {moveBlocks.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </Field>
        </Modal>
      )}
    </div>
  );
}
