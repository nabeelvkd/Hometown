import { Types } from 'mongoose';
import {
  Announcement,
  Business,
  EmergencyContact,
  ServiceProvider,
} from '../models';

interface HomeQuery {
  villageId?: string;
  districtId?: string;
  blockId?: string;
}

/**
 * Assembles the location-first home payload in a single round of parallel
 * queries: announcements, featured businesses, emergency contacts and a
 * sample of service providers for the user's locality.
 *
 * The platform is village-first, so `villageId` is the primary scope; the
 * higher levels are accepted for broader views.
 */
export async function getHomeData({ villageId, districtId, blockId }: HomeQuery) {
  const scope: Record<string, unknown> = {};
  if (villageId) scope.village = new Types.ObjectId(villageId);
  if (blockId) scope.block = new Types.ObjectId(blockId);
  if (districtId) scope.district = new Types.ObjectId(districtId);

  const now = new Date();
  const announcementFilter = {
    ...scope,
    isActive: true,
    $and: [
      { $or: [{ startsAt: { $exists: false } }, { startsAt: { $lte: now } }] },
      { $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gte: now } }] },
    ],
  };

  const [announcements, featuredBusinesses, emergencyContacts, services] =
    await Promise.all([
      Announcement.find(announcementFilter)
        .sort({ isPinned: -1, createdAt: -1 })
        .limit(10),
      Business.find({ ...scope, isActive: true, isFeatured: true })
        .sort({ ratingAverage: -1 })
        .limit(10),
      EmergencyContact.find({ ...scope, isActive: true }).sort({ order: 1, type: 1 }),
      ServiceProvider.find({ ...scope, isActive: true })
        .sort({ isVerified: -1, ratingAverage: -1 })
        .limit(10),
    ]);

  return { announcements, featuredBusinesses, emergencyContacts, services };
}
