import { Request, Response } from 'express';
import { Business, ServiceProvider, Taxi, EmergencyContact } from '../models';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';

/**
 * Unified search across businesses, service providers, taxis and emergency
 * contacts within a locality.
 * GET /api/search?q=...&village=...&district=...&block=...
 */
export const search = async (req: Request, res: Response) => {
  const { q, district, block, village } = req.query as Record<string, string | undefined>;
  if (!q || q.trim().length < 2) {
    throw ApiError.badRequest('Search query must be at least 2 characters');
  }

  const scope: Record<string, unknown> = { isActive: true };
  if (district) scope.district = district;
  if (block) scope.block = block;
  if (village) scope.village = village;

  const regex = { $regex: q.trim(), $options: 'i' };
  const nameMatch = { $or: [{ name: regex }, { nameMl: regex }] };
  const taxiMatch = { $or: [{ driverName: regex }, { vehicleNumber: regex }] };

  const [businesses, providers, taxis, emergency] = await Promise.all([
    Business.find({ ...scope, ...nameMatch }).limit(20),
    ServiceProvider.find({ ...scope, ...nameMatch }).limit(20),
    Taxi.find({ ...scope, ...taxiMatch }).limit(20),
    EmergencyContact.find({ ...scope, ...nameMatch }).limit(20),
  ]);

  sendSuccess(res, {
    query: q,
    businesses,
    serviceProviders: providers,
    taxis,
    emergencyContacts: emergency,
    total: businesses.length + providers.length + taxis.length + emergency.length,
  });
};
