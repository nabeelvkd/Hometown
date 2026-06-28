import { Request, Response } from 'express';
import { HomeCategory, User } from '../models';
import { DEFAULT_HOME_CATEGORIES } from '../models/HomeCategory';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { USER_ROLES } from '../constants';
import { resolveVillageLocation } from '../services/location.service';

/** Creates the default tiles for a village if it has none yet. */
async function ensureDefaults(villageId: string) {
  const count = await HomeCategory.countDocuments({ village: villageId });
  if (count > 0) return;
  const loc = await resolveVillageLocation(villageId);
  await HomeCategory.insertMany(
    DEFAULT_HOME_CATEGORIES.map((c, i) => ({ ...c, order: i, isCustom: false, ...loc }))
  );
}

/** Resolves the village a local admin manages (throws if none). */
async function adminVillage(req: Request): Promise<string> {
  const admin = await User.findById(req.user!.sub).select('village');
  if (!admin?.village) throw ApiError.forbidden('No village is assigned to this admin');
  return admin.village.toString();
}

/** Public: active tiles for a village, ordered. */
export const listHomeCategories = async (req: Request, res: Response) => {
  const { village } = req.query as { village?: string };
  if (!village) {
    sendSuccess(res, []);
    return;
  }
  const cats = await HomeCategory.find({ village, isActive: true }).sort({ order: 1 });
  sendSuccess(res, cats);
};

/** Admin: all tiles for the village (provisions defaults on first open). */
export const adminListHomeCategories = async (req: Request, res: Response) => {
  let village = (req.query as { village?: string }).village;
  if (req.user?.role === USER_ROLES.LOCAL_ADMIN) village = await adminVillage(req);
  if (!village) throw ApiError.badRequest('village is required');

  await ensureDefaults(village);
  const cats = await HomeCategory.find({ village }).sort({ order: 1 });
  sendSuccess(res, cats);
};

export const createHomeCategory = async (req: Request, res: Response) => {
  let village = req.body.village as string;
  if (req.user?.role === USER_ROLES.LOCAL_ADMIN) village = await adminVillage(req);

  await ensureDefaults(village);
  const loc = await resolveVillageLocation(village);
  const max = await HomeCategory.findOne({ village }).sort({ order: -1 }).select('order');
  const key = `custom-${Date.now().toString(36)}`;

  const cat = await HomeCategory.create({
    key,
    label: req.body.label,
    sub: req.body.sub,
    icon: req.body.icon || 'layout-grid',
    color: req.body.color || '#16A34A',
    link: req.body.link,
    template: req.body.template || 'link',
    isCustom: true,
    order: (max?.order ?? 0) + 1,
    ...loc,
  });
  sendSuccess(res, cat, 201);
};

export const updateHomeCategory = async (req: Request, res: Response) => {
  const cat = await HomeCategory.findById(req.params.id);
  if (!cat) throw ApiError.notFound('Category not found');
  if (req.user?.role === USER_ROLES.LOCAL_ADMIN) {
    const v = await adminVillage(req);
    if (String(cat.village) !== v) throw ApiError.forbidden('You can only manage your own village');
  }

  const b = req.body;
  if (b.label !== undefined) cat.label = b.label;
  if (b.sub !== undefined) cat.sub = b.sub;
  if (b.icon !== undefined) cat.icon = b.icon;
  if (b.color !== undefined) cat.color = b.color;
  if (b.link !== undefined) cat.link = b.link || undefined;
  if (b.template !== undefined) cat.template = b.template;
  if (b.isActive !== undefined) cat.isActive = b.isActive;
  await cat.save();
  sendSuccess(res, cat);
};

export const reorderHomeCategories = async (req: Request, res: Response) => {
  let { village } = req.body as { village: string };
  if (req.user?.role === USER_ROLES.LOCAL_ADMIN) village = await adminVillage(req);

  const ids: string[] = req.body.ids;
  await Promise.all(
    ids.map((id, i) => HomeCategory.updateOne({ _id: id, village }, { order: i }))
  );
  const cats = await HomeCategory.find({ village }).sort({ order: 1 });
  sendSuccess(res, cats);
};

export const deleteHomeCategory = async (req: Request, res: Response) => {
  const cat = await HomeCategory.findById(req.params.id);
  if (!cat) throw ApiError.notFound('Category not found');
  if (req.user?.role === USER_ROLES.LOCAL_ADMIN) {
    const v = await adminVillage(req);
    if (String(cat.village) !== v) throw ApiError.forbidden('You can only manage your own village');
  }
  if (!cat.isCustom) {
    throw ApiError.badRequest('Built-in categories cannot be deleted — disable them instead');
  }
  await cat.deleteOne();
  sendSuccess(res, { id: cat._id, deleted: true });
};
