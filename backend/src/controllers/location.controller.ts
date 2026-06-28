import { Request, Response } from 'express';
import {
  District,
  Block,
  Village,
  User,
  Business,
  ServiceProvider,
  Taxi,
  BusTrip,
  EmergencyContact,
  Announcement,
  HomeCategory,
  CategoryEntry,
  Ad,
} from '../models';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { USER_ROLES } from '../constants';
import { destroyImage } from '../config/cloudinary';

export const listDistricts = async (_req: Request, res: Response) => {
  const districts = await District.find({ isActive: true }).sort({ name: 1 });
  sendSuccess(res, districts);
};

export const createDistrict = async (req: Request, res: Response) => {
  const district = await District.create(req.body);
  sendSuccess(res, district, 201);
};

export const listBlocks = async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = { isActive: true };
  if (req.query.district) filter.district = req.query.district;
  const blocks = await Block.find(filter)
    .populate('district', 'name nameMl')
    .sort({ name: 1 });
  sendSuccess(res, blocks);
};

export const createBlock = async (req: Request, res: Response) => {
  const district = await District.findById(req.body.district);
  if (!district) throw ApiError.badRequest('District does not exist');
  const block = await Block.create(req.body);
  sendSuccess(res, block, 201);
};

export const listVillages = async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = { isActive: true };
  if (req.query.block) filter.block = req.query.block;
  if (req.query.district) filter.district = req.query.district;
  const villages = await Village.find(filter)
    .populate('block', 'name nameMl')
    .populate('district', 'name nameMl')
    .sort({ name: 1 });
  sendSuccess(res, villages);
};

export const getVillage = async (req: Request, res: Response) => {
  const village = await Village.findById(req.params.id)
    .populate('block', 'name nameMl')
    .populate('district', 'name nameMl');
  if (!village) throw ApiError.notFound('Village not found');
  sendSuccess(res, village);
};

/**
 * Updates a village (currently its hero image / names). super_admin may edit
 * any village; a local_admin may edit only their own.
 */
export const updateVillage = async (req: Request, res: Response) => {
  if (req.user?.role === USER_ROLES.LOCAL_ADMIN) {
    const admin = await User.findById(req.user.sub).select('village');
    if (String(admin?.village) !== req.params.id) {
      throw ApiError.forbidden('You can only manage your own village');
    }
  }
  const update: Record<string, unknown> = {};
  if (req.body.heroImage !== undefined) update.heroImage = req.body.heroImage || undefined;
  if (req.body.name !== undefined) update.name = req.body.name;
  if (req.body.nameMl !== undefined) update.nameMl = req.body.nameMl;

  // Moving the village to another area/block (super_admin only) — re-derive the
  // district from the new block.
  let movedBlock: unknown;
  let movedDistrict: unknown;
  if (req.body.block !== undefined) {
    if (req.user?.role !== USER_ROLES.SUPER_ADMIN) {
      throw ApiError.forbidden('Only the super admin can move a village');
    }
    const block = await Block.findById(req.body.block).select('district');
    if (!block) throw ApiError.badRequest('Area/block does not exist');
    update.block = block._id;
    update.district = block.district;
    movedBlock = block._id;
    movedDistrict = block.district;
  }

  // Capture the current hero before overwriting so we can clean it up.
  const oldHero =
    req.body.heroImage !== undefined
      ? (await Village.findById(req.params.id).select('heroImage'))?.heroImage
      : undefined;

  const village = await Village.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!village) throw ApiError.notFound('Village not found');

  // Moving a village re-stamps the village's admins AND all its content with the
  // new district/block, so everything stays consistent under the new area.
  if (movedBlock) {
    const filter = { village: village._id };
    const set = { $set: { block: movedBlock, district: movedDistrict } };
    await Promise.all([
      User.updateMany(filter, set),
      Business.updateMany(filter, set),
      ServiceProvider.updateMany(filter, set),
      Taxi.updateMany(filter, set),
      BusTrip.updateMany(filter, set),
      EmergencyContact.updateMany(filter, set),
      Announcement.updateMany(filter, set),
      HomeCategory.updateMany(filter, set),
      CategoryEntry.updateMany(filter, set),
      Ad.updateMany(filter, set),
    ]);
  }

  // Hero image replaced or cleared → drop the previous one from Cloudinary.
  if (oldHero && oldHero !== village.heroImage) {
    await destroyImage(oldHero);
  }
  sendSuccess(res, village);
};

export const createVillage = async (req: Request, res: Response) => {
  // Derive (and validate) the district from the parent block.
  const block = await Block.findById(req.body.block);
  if (!block) throw ApiError.badRequest('Block does not exist');
  const village = await Village.create({
    name: req.body.name,
    nameMl: req.body.nameMl,
    block: block._id,
    district: block.district,
  });
  sendSuccess(res, village, 201);
};
