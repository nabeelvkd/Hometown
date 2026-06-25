import { Request, Response } from 'express';
import { Announcement } from '../models';
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

/** Filter that hides announcements outside their start/expiry window. */
function activeWindow(now: Date) {
  return {
    isActive: true,
    $and: [
      { $or: [{ startsAt: { $exists: false } }, { startsAt: { $lte: now } }] },
      { $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gte: now } }] },
    ],
  };
}

export const listAnnouncements = async (req: Request, res: Response) => {
  const { page, limit, district, block, village, type } = req.query as Record<
    string,
    string | undefined
  >;

  const filter: Record<string, unknown> = { ...activeWindow(new Date()) };
  if (district) filter.district = district;
  if (block) filter.block = block;
  if (village) filter.village = village;
  if (type) filter.type = type;

  const { skip, limit: lim, page: pg } = buildPagination(Number(page), Number(limit));

  const [items, total] = await Promise.all([
    Announcement.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(lim),
    Announcement.countDocuments(filter),
  ]);

  sendSuccess(res, items, 200, paginationMeta(pg, lim, total));
};

export const createAnnouncement = async (req: Request, res: Response) => {
  const payload: Record<string, unknown> = await withLocation(req.body);
  if (req.user) payload.publishedBy = req.user.sub;
  const announcement = await Announcement.create(payload);
  sendSuccess(res, announcement, 201);
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  const announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    await withLocation(req.body),
    {
      new: true,
      runValidators: true,
    }
  );
  if (!announcement) throw ApiError.notFound('Announcement not found');
  sendSuccess(res, announcement);
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  const announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!announcement) throw ApiError.notFound('Announcement not found');
  sendSuccess(res, { id: announcement._id, deleted: true });
};
