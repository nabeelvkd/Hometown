import { Request, Response } from 'express';
import { Ad, User, Village, Block } from '../models';
import { AD_STATUS, AD_TARGET } from '../models/Ad';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { USER_ROLES } from '../constants';
import { resolveVillageLocation } from '../services/location.service';
import { destroyImage } from '../config/cloudinary';

/**
 * Public endpoint for the mobile app — only live, approved ads for a village
 * (plus any global approved ads).
 */
export const listPublicAds = async (req: Request, res: Response) => {
  const { village } = req.query as { village?: string };
  const now = new Date();

  // Resolve the requesting village's district/block so we can match ads that
  // target the whole district or block, not just this village.
  let vDistrict: unknown;
  let vBlock: unknown;
  if (village) {
    const v = await Village.findById(village).select('district block').lean();
    vDistrict = v?.district;
    vBlock = v?.block;
  }

  // An ad is shown if it targets: all villages, this village's district, this
  // village's block, or this village specifically (plus legacy ads with no
  // target field).
  const targetMatch: Record<string, unknown>[] = [
    { target: AD_TARGET.ALL },
    // legacy global ads created before targeting existed
    { target: { $exists: false }, village: { $exists: false } },
    { target: { $exists: false }, village: null },
  ];
  if (village) {
    targetMatch.push({ target: AD_TARGET.VILLAGE, village });
    targetMatch.push({ target: { $exists: false }, village }); // legacy village ads
  }
  if (vBlock) targetMatch.push({ target: AD_TARGET.BLOCK, block: vBlock });
  if (vDistrict) targetMatch.push({ target: AD_TARGET.DISTRICT, district: vDistrict });

  const scope: Record<string, unknown> = {
    status: AD_STATUS.APPROVED,
    isActive: true,
    $and: [
      { $or: [{ startsAt: { $exists: false } }, { startsAt: { $lte: now } }] },
      { $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gte: now } }] },
      { $or: targetMatch },
    ],
  };

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
    .populate('district', 'name')
    .populate('block', 'name')
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

  if (!isSuper) {
    // Local admins can only target their own village (pending approval).
    const admin = await User.findById(req.user!.sub).select('village');
    if (!admin?.village) throw ApiError.forbidden('No village assigned to this admin');
    Object.assign(payload, await resolveVillageLocation(admin.village.toString()));
    payload.target = AD_TARGET.VILLAGE;
    payload.status = AD_STATUS.PENDING;
  } else {
    // Super admin chooses the targeting granularity.
    const target = (req.body.target as string) || AD_TARGET.VILLAGE;
    payload.target = target;

    if (target === AD_TARGET.VILLAGE) {
      if (!req.body.village) throw ApiError.badRequest('Select a village for this ad');
      Object.assign(payload, await resolveVillageLocation(req.body.village));
    } else if (target === AD_TARGET.BLOCK) {
      if (!req.body.block) throw ApiError.badRequest('Select an area/block for this ad');
      const block = await Block.findById(req.body.block).select('district');
      if (!block) throw ApiError.badRequest('Block not found');
      payload.block = block._id;
      payload.district = block.district;
    } else if (target === AD_TARGET.DISTRICT) {
      if (!req.body.district) throw ApiError.badRequest('Select a district for this ad');
      payload.district = req.body.district;
    }
    // target === 'all' → no location fields

    payload.status = AD_STATUS.APPROVED;
    payload.reviewedBy = req.user?.sub;
  }

  const ad = await Ad.create(payload);
  sendSuccess(res, ad, 201);
};

/**
 * Edits an ad. super_admin may edit any ad (incl. its targeting + active flag);
 * local_admin may edit only their own village's ad, which returns to pending.
 */
export const updateAd = async (req: Request, res: Response) => {
  const ad = await Ad.findById(req.params.id);
  if (!ad) throw ApiError.notFound('Ad not found');

  const isSuper = req.user?.role === USER_ROLES.SUPER_ADMIN;
  if (!isSuper) {
    const admin = await User.findById(req.user!.sub).select('village');
    if (String(ad.village) !== String(admin?.village)) {
      throw ApiError.forbidden('You can only manage your own village');
    }
  }

  const b = req.body;
  if (b.title !== undefined) ad.title = b.title;
  if (b.subtitle !== undefined) ad.subtitle = b.subtitle || undefined;
  if (b.cta !== undefined) ad.cta = b.cta || undefined;
  if (b.ctaUrl !== undefined) ad.ctaUrl = b.ctaUrl || undefined;
  if (b.expiresAt !== undefined) ad.expiresAt = b.expiresAt;

  // Image replaced or cleared → free the old one from Cloudinary.
  if (b.image !== undefined && b.image !== ad.image) {
    const old = ad.image;
    ad.image = b.image || undefined;
    if (old) await destroyImage(old);
  }

  if (isSuper) {
    if (b.target !== undefined) {
      ad.set('target', b.target);
      ad.set('village', undefined);
      ad.set('block', undefined);
      ad.set('district', undefined);
      if (b.target === AD_TARGET.VILLAGE) {
        if (!b.village) throw ApiError.badRequest('Select a village for this ad');
        Object.assign(ad, await resolveVillageLocation(b.village));
      } else if (b.target === AD_TARGET.BLOCK) {
        if (!b.block) throw ApiError.badRequest('Select an area/block for this ad');
        const block = await Block.findById(b.block).select('district');
        if (!block) throw ApiError.badRequest('Block not found');
        ad.block = block._id;
        ad.district = block.district;
      } else if (b.target === AD_TARGET.DISTRICT) {
        if (!b.district) throw ApiError.badRequest('Select a district for this ad');
        ad.district = b.district;
      }
    }
    if (b.isActive !== undefined) ad.isActive = b.isActive;
  } else {
    // Edited content needs re-approval.
    ad.status = AD_STATUS.PENDING;
  }

  await ad.save();
  sendSuccess(res, ad);
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
  const ad = await Ad.findById(req.params.id).select('village image');
  if (!ad) throw ApiError.notFound('Ad not found');
  // Local admins may only delete their own village's ads.
  if (req.user?.role === USER_ROLES.LOCAL_ADMIN) {
    const admin = await User.findById(req.user.sub).select('village');
    if (String(ad.village) !== String(admin?.village)) {
      throw ApiError.forbidden('You can only manage your own village');
    }
  }
  await Ad.findByIdAndDelete(req.params.id);
  await destroyImage(ad.image); // free the banner image from Cloudinary
  sendSuccess(res, { id: req.params.id, deleted: true });
};
