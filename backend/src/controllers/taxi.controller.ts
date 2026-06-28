import { Request, Response } from 'express';
import { Taxi } from '../models';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { buildPagination, paginationMeta } from '../utils/pagination';
import { resolveVillageLocation } from '../services/location.service';
import { destroyImage } from '../config/cloudinary';

/** Derives district/block from the village so the chain stays consistent. */
async function withLocation<T extends { village?: string }>(body: T) {
  if (body.village) {
    return { ...body, ...(await resolveVillageLocation(body.village)) };
  }
  return body;
}

export const listTaxis = async (req: Request, res: Response) => {
  const { page, limit, district, block, village, vehicleType, q } = req.query as Record<
    string,
    string | undefined
  >;

  const filter: Record<string, unknown> = { isActive: true };
  if (district) filter.district = district;
  if (block) filter.block = block;
  if (village) filter.village = village;
  if (vehicleType) filter.vehicleType = vehicleType;
  if (q) filter.driverName = { $regex: q, $options: 'i' };

  const { skip, limit: lim, page: pg } = buildPagination(Number(page), Number(limit));
  const [items, total] = await Promise.all([
    Taxi.find(filter).sort({ available: -1, isVerified: -1, ratingAverage: -1 }).skip(skip).limit(lim),
    Taxi.countDocuments(filter),
  ]);
  sendSuccess(res, items, 200, paginationMeta(pg, lim, total));
};

export const getTaxi = async (req: Request, res: Response) => {
  const taxi = await Taxi.findById(req.params.id)
    .populate('village', 'name nameMl')
    .populate('block', 'name nameMl');
  if (!taxi) throw ApiError.notFound('Taxi not found');
  sendSuccess(res, taxi);
};

export const createTaxi = async (req: Request, res: Response) => {
  const taxi = await Taxi.create(await withLocation(req.body));
  sendSuccess(res, taxi, 201);
};

export const updateTaxi = async (req: Request, res: Response) => {
  const existing = await Taxi.findById(req.params.id).select('photo');
  if (!existing) throw ApiError.notFound('Taxi not found');
  const taxi = await Taxi.findByIdAndUpdate(req.params.id, await withLocation(req.body), {
    new: true,
    runValidators: true,
  });
  if (!taxi) throw ApiError.notFound('Taxi not found');
  // Photo replaced or cleared → drop the previous one from Cloudinary.
  if (req.body.photo !== undefined && existing.photo && existing.photo !== taxi.photo) {
    await destroyImage(existing.photo);
  }
  sendSuccess(res, taxi);
};

export const deleteTaxi = async (req: Request, res: Response) => {
  const taxi = await Taxi.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!taxi) throw ApiError.notFound('Taxi not found');
  await destroyImage(taxi.photo);
  sendSuccess(res, { id: taxi._id, deleted: true });
};
