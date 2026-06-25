import { Request, Response } from 'express';
import { Ad, User } from '../models';
import { AD_STATUS } from '../models/Ad';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { USER_ROLES } from '../constants';
import { resolveVillageLocation } from '../services/location.service';

/**
 * Public endpoint for the mobile app — only live, approved ads for a village
 * (plus any global approved ads).
 */
export const listPublicAds = async (req: Request, res: Response) => {
  const { village } = req.query as { village?: string };
  const now = new Date();
  const scope: Record<string, unknown> = {
    status: AD_STATUS.APPROVED,
    isActive: true,
    $and: [
      { $or: [{ startsAt: { $exists: false } }, { startsAt: { $lte: now } }] },
      { $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gte: now } }] },
    ],
  };
  if (village) {
    // Village-targeted ads OR global (no village) ads.
    scope.$or = [{ village }, { village: { $exists: false } }, { village: null }];
  }
  const ads = await Ad.find(scope).sort({ createdAt: -1 }).limit(10);
  sendSuccess(res, ads);
};

/** Admin listing. super_admin sees all; local_admin sees their village's ads. */
export const listAds = async (req: Request, res: Response) => {
  const { status } = req.query as { status?: string };
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  if (req.user?.role === USER_ROLES.LOCAL_ADMIN) {
    const admin = await User.findById(req.user.sub).select('village');
    filter.village = admin?.village;
  }

  const ads = await Ad.find(filter)
    .populate('village', 'name')
    .populate('createdBy', 'name role')
    .sort({ createdAt: -1 });
  sendSuccess(res, ads);
};

/**
 * Creates an ad. local_admin ads are pinned to their village and start as
 * pending (need super_admin approval); super_admin ads are auto-approved.
 */
export const createAd = async (req: Request, res: Response) => {
  const isSuper = req.user?.role === USER_ROLES.SUPER_ADMIN;
  const payload: Record<string, unknown> = {
    title: req.body.title,
    subtitle: req.body.subtitle,
    cta: req.body.cta,
    ctaUrl: req.body.ctaUrl,
    image: req.body.image,
    expiresAt: req.body.expiresAt,
    createdBy: req.user?.sub,
    createdByRole: req.user?.role,
  };

  let villageId: string | undefined = req.body.village;
  if (!isSuper) {
    // Local admins can only target their own village.
    const admin = await User.findById(req.user!.sub).select('village');
    if (!admin?.village) throw ApiError.forbidden('No village assigned to this admin');
    villageId = admin.village.toString();
  }
  if (villageId) {
    Object.assign(payload, await resolveVillageLocation(villageId));
  }
  payload.status = isSuper ? AD_STATUS.APPROVED : AD_STATUS.PENDING;
  if (isSuper) payload.reviewedBy = req.user?.sub;

  const ad = await Ad.create(payload);
  sendSuccess(res, ad, 201);
};

/** super_admin: approve / reject / toggle active. */
export const reviewAd = async (req: Request, res: Response) => {
  const update: Record<string, unknown> = { reviewedBy: req.user?.sub };
  if (req.body.status !== undefined) update.status = req.body.status;
  if (req.body.isActive !== undefined) update.isActive = req.body.isActive;

  const ad = await Ad.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!ad) throw ApiError.notFound('Ad not found');
  sendSuccess(res, ad);
};

export const deleteAd = async (req: Request, res: Response) => {
  // Local admins may only delete their own village's ads.
  if (req.user?.role === USER_ROLES.LOCAL_ADMIN) {
    const admin = await User.findById(req.user.sub).select('village');
    const ad = await Ad.findById(req.params.id).select('village');
    if (!ad) throw ApiError.notFound('Ad not found');
    if (String(ad.village) !== String(admin?.village)) {
      throw ApiError.forbidden('You can only manage your own village');
    }
  }
  await Ad.findByIdAndDelete(req.params.id);
  sendSuccess(res, { id: req.params.id, deleted: true });
};
