import { Request, Response } from 'express';
import { EmergencyContact } from '../models';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { resolveVillageLocation } from '../services/location.service';

/** Derives district/block from the village so the chain stays consistent. */
async function withLocation<T extends { village?: string }>(body: T) {
  if (body.village) {
    return { ...body, ...(await resolveVillageLocation(body.village)) };
  }
  return body;
}

export const listEmergencyContacts = async (req: Request, res: Response) => {
  const { district, block, village, type } = req.query as Record<
    string,
    string | undefined
  >;
  const filter: Record<string, unknown> = { isActive: true };
  if (district) filter.district = district;
  if (block) filter.block = block;
  if (village) filter.village = village;
  if (type) filter.type = type;

  const contacts = await EmergencyContact.find(filter).sort({ order: 1, type: 1 });
  sendSuccess(res, contacts);
};

export const createEmergencyContact = async (req: Request, res: Response) => {
  const contact = await EmergencyContact.create(await withLocation(req.body));
  sendSuccess(res, contact, 201);
};

export const updateEmergencyContact = async (req: Request, res: Response) => {
  const contact = await EmergencyContact.findByIdAndUpdate(
    req.params.id,
    await withLocation(req.body),
    {
      new: true,
      runValidators: true,
    }
  );
  if (!contact) throw ApiError.notFound('Emergency contact not found');
  sendSuccess(res, contact);
};

export const deleteEmergencyContact = async (req: Request, res: Response) => {
  const contact = await EmergencyContact.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!contact) throw ApiError.notFound('Emergency contact not found');
  sendSuccess(res, { id: contact._id, deleted: true });
};
