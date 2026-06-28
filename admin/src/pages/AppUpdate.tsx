import { useEffect, useState } from 'react';
import { Field, Checkbox } from '../components/fields';
import { appUpdateApi } from '../api/resources';
import { ApiError } from '../api/client';
import type { AppUpdateConfig } from '../types';

const EMPTY: AppUpdateConfig = {
  latestVersion: '',
  androidUrl: '',
  iosUrl: '',
  title: 'Update available',
  message: 'A new version of the app is available. Please update for the best experience.',
  mandatory: false,
  active: false,
};

export function AppUpdate() {
  const [form, setForm] = useState<AppUpdateConfig>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<AppUpdateConfig>) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    appUpdateApi
      .get()
      .then((r) => setForm({ ...EMPTY, ...r.data }))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    setError(null);
    try {
      const r = await appUpdateApi.update({
        latestVersion: form.latestVersion.trim(),
        androidUrl: form.androidUrl?.trim() ?? '',
        iosUrl: form.iosUrl?.trim() ?? '',
        title: form.title,
        message: form.message,
        mandatory: form.mandatory,
        active: form.active,
      });
      setForm({ ...EMPTY, ...r.data });
      setMsg('Saved. The mobile app will show this on next launch.');
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ marginTop: 0 }}>Mobile app update</h3>
        <p className="muted" style={{ marginTop: 4 }}>
          Prompt users to update the app. Users on an older version than the one below will see a
          popup with your Update button. Mark it <strong>mandatory</strong> to force the update
          (no “Later”), or leave it off for an optional feature update.
        </p>

        {error && <div className="alert error" style={{ marginTop: 16 }}>{error}</div>}
        {msg && (
          <div
            className="alert"
            style={{ marginTop: 16, background: 'var(--primary-soft)', color: 'var(--primary-dark)' }}>
            {msg}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <Field label="Latest version" required>
            <input
              value={form.latestVersion}
              onChange={(e) => set({ latestVersion: e.target.value })}
              placeholder="e.g. 1.1.0"
            />
          </Field>

          <Field label="Android update link (Play Store or APK URL)">
            <input
              value={form.androidUrl ?? ''}
              onChange={(e) => set({ androidUrl: e.target.value })}
              placeholder="https://play.google.com/store/apps/details?id=com.nabeel.nattile"
            />
          </Field>

          <Field label="iOS update link (App Store URL)">
            <input
              value={form.iosUrl ?? ''}
              onChange={(e) => set({ iosUrl: e.target.value })}
              placeholder="https://apps.apple.com/app/idXXXXXXXXX"
            />
          </Field>

          <Field label="Popup title">
            <input value={form.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>

          <Field label="Popup message">
            <textarea
              value={form.message}
              onChange={(e) => set({ message: e.target.value })}
              rows={3}
            />
          </Field>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            <Checkbox
              label="Mandatory (force update — users can't dismiss)"
              checked={form.mandatory}
              onChange={(mandatory) => set({ mandatory })}
            />
            <Checkbox
              label="Active (show the popup to users)"
              checked={form.active}
              onChange={(active) => set({ active })}
            />
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button className="btn" onClick={save} disabled={saving || loading || !form.latestVersion.trim()}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>

          <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>
            Tip: set the version to your newest release (higher than what users have installed). When
            you’re done rolling out, untick <strong>Active</strong> to stop the popup.
          </p>
        </div>
      </div>
    </div>
  );
}
