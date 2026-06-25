import { Types } from 'mongoose';
import { Village } from '../models';
import { ApiError } from '../utils/ApiError';

export interface ResolvedLocation {
  district: Types.ObjectId;
  block: Types.ObjectId;
  village: Types.ObjectId;
}

/**
 * Given a village id, returns its full location chain (district + block +
 * village). Content always belongs to a village, and the higher levels are
 * derived from it so they can never drift out of sync.
 */
export async function resolveVillageLocation(
  villageId: string
): Promise<ResolvedLocation> {
  const village = await Village.findById(villageId);
  if (!village) throw ApiError.badRequest('Village does not exist');
  return {
    district: village.district,
    block: village.block,
    village: village._id,
  };
}
