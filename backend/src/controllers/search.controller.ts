import { Request, Response } from 'express';
import { Business, ServiceProvider } from '../models';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';

/**
 * Unified search across businesses and service providers within a locality.
 * GET /api/search?q=...&district=...&block=...
 */
export const search = async (req: Request, res: Response) => {
  const { q, district, block } = req.query as Record<string, string | undefined>;
  if (!q || q.trim().length < 2) {
    throw ApiError.badRequest('Search query must be at least 2 characters');
  }

  const scope: Record<string, unknown> = { isActive: true };
  if (district) scope.district = district;
  if (block) scope.block = block;

  const regex = { $regex: q.trim(), $options: 'i' };
  const textMatch = { $or: [{ name: regex }, { nameMl: regex }] };

  const [businesses, providers] = await Promise.all([
    Business.find({ ...scope, ...textMatch }).limit(20),
    ServiceProvider.find({ ...scope, ...textMatch }).limit(20),
  ]);

  sendSuccess(res, {
    query: q,
    businesses,
    serviceProviders: providers,
    total: businesses.length + providers.length,
  });
};
