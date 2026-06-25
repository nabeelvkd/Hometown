import { Request, Response } from 'express';
import { ServiceProvider } from '../models';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { buildPagination, paginationMeta } from '../utils/pagination';
import { resolveVillageLocation } from '../services/location.service';

/** Derives district/block from the village so the chain stays consistent. */
async function withLocation<T extends { village?: string }>(body: T) {
  if (body.village) {
    return { ...body, ...(await resolveVillageLocation(body.village)) };
  }
  return body;
}

export const listProviders = async (req: Request, res: Response) => {
  const { page, limit, district, block, village, category, verified, q } =
    req.query as Record<string, string | undefined>;

  const filter: Record<string, unknown> = { isActive: true };
  if (district) filter.district = district;
  if (block) filter.block = block;
  if (village) filter.village = village;
  if (category) filter.category = category;
  if (verified !== undefined) filter.isVerified = verified === 'true';
  if (q) filter.name = { $regex: q, $options: 'i' };

  const { skip, limit: lim, page: pg } = buildPagination(Number(page), Number(limit));

  const [items, total] = await Promise.all([
    ServiceProvider.find(filter)
      .sort({ isVerified: -1, ratingAverage: -1, experienceYears: -1 })
      .skip(skip)
      .limit(lim),
    ServiceProvider.countDocuments(filter),
  ]);

  sendSuccess(res, items, 200, paginationMeta(pg, lim, total));
};

export const getProvider = async (req: Request, res: Response) => {
  const provider = await ServiceProvider.findById(req.params.id)
    .populate('district', 'name nameMl')
    .populate('block', 'name nameMl')
    .populate('village', 'name nameMl');
  if (!provider) throw ApiError.notFound('Service provider not found');
  sendSuccess(res, provider);
};

export const createProvider = async (req: Request, res: Response) => {
  const provider = await ServiceProvider.create(await withLocation(req.body));
  sendSuccess(res, provider, 201);
};

export const updateProvider = async (req: Request, res: Response) => {
  const provider = await ServiceProvider.findByIdAndUpdate(
    req.params.id,
    await withLocation(req.body),
    { new: true, runValidators: true }
  );
  if (!provider) throw ApiError.notFound('Service provider not found');
  sendSuccess(res, provider);
};

export const deleteProvider = async (req: Request, res: Response) => {
  const provider = await ServiceProvider.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!provider) throw ApiError.notFound('Service provider not found');
  sendSuccess(res, { id: provider._id, deleted: true });
};
