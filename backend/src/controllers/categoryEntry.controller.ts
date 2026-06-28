import { Request, Response } from 'express';
import { CategoryEntry, HomeCategory, User } from '../models';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { USER_ROLES } from '../constants';
import { destroyImage } from '../config/cloudinary';

/** Loads a category and (for local admins) verifies it belongs to their village. */
async function categoryForAdmin(req: Request, categoryId: string) {
  const cat = await HomeCategory.findById(categoryId);
  if (!cat) throw ApiError.badRequest('Category does not exist');
  if (req.user?.role === USER_ROLES.LOCAL_ADMIN) {
    const admin = await User.findById(req.user.sub).select('village');
    if (String(cat.village) !== String(admin?.village)) {
      throw ApiError.forbidden('You can only manage your own village');
    }
  }
  return cat;
}

/** Public: active items for a category, ordered. */
export const listEntries = async (req: Request, res: Response) => {
  const { category } = req.query as { category: string };
  const items = await CategoryEntry.find({ category, isActive: true }).sort({ order: 1, createdAt: 1 });
  sendSuccess(res, items);
};

/** Admin: all items for a category (manage view). */
export const adminListEntries = async (req: Request, res: Response) => {
  const { category } = req.query as { category: string };
  await categoryForAdmin(req, category);
  const items = await CategoryEntry.find({ category }).sort({ order: 1, createdAt: 1 });
  sendSuccess(res, items);
};

export const createEntry = async (req: Request, res: Response) => {
  const cat = await categoryForAdmin(req, req.body.category);
  const max = await CategoryEntry.findOne({ category: cat._id }).sort({ order: -1 }).select('order');
  const entry = await CategoryEntry.create({
    ...req.body,
    order: (max?.order ?? 0) + 1,
    district: cat.district,
    block: cat.block,
    village: cat.village,
  });
  sendSuccess(res, entry, 201);
};

export const updateEntry = async (req: Request, res: Response) => {
  const entry = await CategoryEntry.findById(req.params.id);
  if (!entry) throw ApiError.notFound('Item not found');
  await categoryForAdmin(req, String(entry.category));
  const oldPhoto = entry.photo;
  Object.assign(entry, req.body);
  await entry.save();
  // Photo replaced or cleared → drop the previous one from Cloudinary.
  if (req.body.photo !== undefined && oldPhoto && oldPhoto !== entry.photo) {
    await destroyImage(oldPhoto);
  }
  sendSuccess(res, entry);
};

export const deleteEntry = async (req: Request, res: Response) => {
  const entry = await CategoryEntry.findById(req.params.id);
  if (!entry) throw ApiError.notFound('Item not found');
  await categoryForAdmin(req, String(entry.category));
  await entry.deleteOne();
  await destroyImage(entry.photo);
  sendSuccess(res, { id: entry._id, deleted: true });
};
