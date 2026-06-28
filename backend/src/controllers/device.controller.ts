import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AppDevice, Village } from '../models';
import { sendSuccess } from '../utils/response';
import { resolveVillageLocation } from '../services/location.service';

/**
 * Public — the mobile app pings on launch with a stable anonymous deviceId and
 * the selected village. We upsert by deviceId, keeping the latest village, so
 * each install counts once per village.
 */
export const pingDevice = async (req: Request, res: Response) => {
  const { deviceId, village } = req.body as { deviceId: string; village?: string };

  const set: Record<string, unknown> = { lastSeenAt: new Date() };
  if (village) {
    const loc = await resolveVillageLocation(village);
    set.village = loc.village;
    set.district = loc.district;
    set.block = loc.block;
  }

  await AppDevice.findOneAndUpdate(
    { deviceId },
    { $set: set, $setOnInsert: { deviceId } },
    { upsert: true, new: true }
  );
  sendSuccess(res, { ok: true });
};

/** super_admin — unique app users (devices) grouped by village. */
export const deviceStats = async (req: Request, res: Response) => {
  const { district } = req.query as { district?: string };

  const match: Record<string, unknown> = { village: { $ne: null } };
  if (district) match.district = new mongoose.Types.ObjectId(district);

  const rows = await AppDevice.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
    { $match: match },
    { $group: { _id: '$village', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const villages = await Village.find({ _id: { $in: rows.map((r) => r._id) } }).select('name');
  const nameById = new Map(villages.map((v) => [String(v._id), v.name]));

  const data = rows.map((r) => ({
    village: String(r._id),
    name: nameById.get(String(r._id)) ?? 'Unknown',
    count: r.count,
  }));
  const total = data.reduce((sum, r) => sum + r.count, 0);

  sendSuccess(res, { total, villages: data });
};
