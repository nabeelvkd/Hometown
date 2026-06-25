import { Request, Response } from 'express';
import { Business } from '../models';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { buildPagination, paginationMeta } from '../utils/pagination';
import { resolveVillageLocation } from '../services/location.service';

/** Maps an optional [lng,lat] coordinates field onto a GeoJSON location. */
function withCoordinates<T extends { coordinates?: [number, number] }>(body: T) {
  const { coordinates, ...rest } = body;
  if (coordinates) {
    return { ...rest, location: { type: 'Point' as const, coordinates } };
  }
  return rest;
}

/** Derives district/block from the village so the chain stays consistent. */
async function withLocation<T extends { village?: string; coordinates?: [number, number] }>(
  body: T
) {
  const mapped = withCoordinates(body);
  if (body.village) {
    return { ...mapped, ...(await resolveVillageLocation(body.village)) };
  }
  return mapped;
}

export const listBusinesses = async (req: Request, res: Response) => {
  const { page, limit, district, block, village, category, featured, verified, q } =
    req.query as Record<string, string | undefined>;

  const filter: Record<string, unknown> = { isActive: true };
  if (district) filter.district = district;
  if (block) filter.block = block;
  if (village) filter.village = village;
  if (category) filter.category = category;
  if (featured !== undefined) filter.isFeatured = featured === 'true';
  if (verified !== undefined) filter.isVerified = verified === 'true';
  if (q) filter.name = { $regex: q, $options: 'i' };

  const { skip, limit: lim, page: pg } = buildPagination(Number(page), Number(limit));

  const [items, total] = await Promise.all([
    Business.find(filter)
      .sort({ isFeatured: -1, ratingAverage: -1, name: 1 })
      .skip(skip)
      .limit(lim),
    Business.countDocuments(filter),
  ]);

  sendSuccess(res, items, 200, paginationMeta(pg, lim, total));
};

export const getBusiness = async (req: Request, res: Response) => {
  const business = await Business.findById(req.params.id)
    .populate('district', 'name nameMl')
    .populate('block', 'name nameMl')
    .populate('village', 'name nameMl');
  if (!business) throw ApiError.notFound('Business not found');
  sendSuccess(res, business);
};

export const createBusiness = async (req: Request, res: Response) => {
  const business = await Business.create(await withLocation(req.body));
  sendSuccess(res, business, 201);
};

export const updateBusiness = async (req: Request, res: Response) => {
  const business = await Business.findByIdAndUpdate(
    req.params.id,
    await withLocation(req.body),
    { new: true, runValidators: true }
  );
  if (!business) throw ApiError.notFound('Business not found');
  sendSuccess(res, business);
};

export const deleteBusiness = async (req: Request, res: Response) => {
  // Soft delete: keep the record but hide it from listings.
  const business = await Business.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!business) throw ApiError.notFound('Business not found');
  sendSuccess(res, { id: business._id, deleted: true });
};
