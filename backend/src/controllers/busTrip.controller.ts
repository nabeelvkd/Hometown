import { Request, Response } from 'express';
import { BusTrip } from '../models';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { resolveVillageLocation } from '../services/location.service';

async function withLocation<T extends { village?: string }>(body: T) {
  if (body.village) {
    return { ...body, ...(await resolveVillageLocation(body.village)) };
  }
  return body;
}

export const listBusTrips = async (req: Request, res: Response) => {
  const { district, block, village, destination, tag } = req.query as Record<
    string,
    string | undefined
  >;
  const filter: Record<string, unknown> = { isActive: true };
  if (district) filter.district = district;
  if (block) filter.block = block;
  if (village) filter.village = village;
  if (destination) filter.destination = destination;
  if (tag) filter.tags = tag;

  // Sorted by time string ("HH:MM" sorts chronologically as text).
  const items = await BusTrip.find(filter).sort({ time: 1 }).limit(300);
  sendSuccess(res, items);
};

export const createBusTrip = async (req: Request, res: Response) => {
  const trip = await BusTrip.create(await withLocation(req.body));
  sendSuccess(res, trip, 201);
};

export const updateBusTrip = async (req: Request, res: Response) => {
  const trip = await BusTrip.findByIdAndUpdate(req.params.id, await withLocation(req.body), {
    new: true,
    runValidators: true,
  });
  if (!trip) throw ApiError.notFound('Bus trip not found');
  sendSuccess(res, trip);
};

export const deleteBusTrip = async (req: Request, res: Response) => {
  const trip = await BusTrip.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!trip) throw ApiError.notFound('Bus trip not found');
  sendSuccess(res, { id: trip._id, deleted: true });
};
