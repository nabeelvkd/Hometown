import { Request, Response } from 'express';
import { AppUpdate } from '../models';
import { sendSuccess } from '../utils/response';

/** Compares dotted versions ("1.2.0" vs "1.10.1"). Returns -1 / 0 / 1. */
function cmpVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

/** Loads the singleton config, creating an empty one on first access. */
async function getOrInit() {
  return (await AppUpdate.findOne()) ?? (await AppUpdate.create({}));
}

/**
 * Public — the mobile app calls this on launch with its platform + version.
 * Returns whether an update is available and whether it's mandatory.
 */
export const checkUpdate = async (req: Request, res: Response) => {
  const { platform, version } = req.query as { platform?: string; version?: string };
  const cfg = await AppUpdate.findOne();

  if (!cfg || !cfg.active || !cfg.latestVersion) {
    return sendSuccess(res, { updateAvailable: false });
  }

  const current = version || '0.0.0';
  if (cmpVersions(current, cfg.latestVersion) >= 0) {
    return sendSuccess(res, { updateAvailable: false });
  }

  const url =
    platform === 'ios' ? cfg.iosUrl || cfg.androidUrl : cfg.androidUrl || cfg.iosUrl;

  return sendSuccess(res, {
    updateAvailable: true,
    mandatory: cfg.mandatory,
    latestVersion: cfg.latestVersion,
    title: cfg.title,
    message: cfg.message,
    url: url || '',
  });
};

/** Public — latest published version + download links (for the website). */
export const getLatest = async (_req: Request, res: Response) => {
  const cfg = await AppUpdate.findOne();
  sendSuccess(res, {
    version: cfg?.latestVersion || '',
    androidUrl: cfg?.androidUrl || '',
    iosUrl: cfg?.iosUrl || '',
  });
};

/** super_admin — read the current config to populate the admin form. */
export const getUpdateConfig = async (_req: Request, res: Response) => {
  const cfg = await getOrInit();
  sendSuccess(res, cfg);
};

/** super_admin — save the config (what the app will show). */
export const setUpdateConfig = async (req: Request, res: Response) => {
  const cfg = await getOrInit();
  const { latestVersion, androidUrl, iosUrl, title, message, mandatory, active } = req.body;

  if (latestVersion !== undefined) cfg.latestVersion = latestVersion;
  if (androidUrl !== undefined) cfg.androidUrl = androidUrl || undefined;
  if (iosUrl !== undefined) cfg.iosUrl = iosUrl || undefined;
  if (title !== undefined) cfg.title = title;
  if (message !== undefined) cfg.message = message;
  if (mandatory !== undefined) cfg.mandatory = mandatory;
  if (active !== undefined) cfg.active = active;

  await cfg.save();
  sendSuccess(res, cfg);
};
