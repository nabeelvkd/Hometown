import { z } from 'zod';
import { objectId, phone, paginationQuery } from './common';

const vehicleType = z.string().trim().min(1).max(40);

const taxiBody = z.object({
  driverName: z.string().trim().min(1).max(120),
  photo: z.string().trim().url().optional(),
  phone,
  whatsapp: phone.optional(),
  vehicleType,
  vehicleNumber: z.string().trim().min(1).max(20),
  seats: z.number().int().min(1).max(60).optional(),
  available: z.boolean().optional(),
  description: z.string().trim().max(2000).optional(),
  village: objectId,
  isVerified: z.boolean().optional(),
});

export const listTaxisSchema = z.object({
  query: paginationQuery.extend({
    district: objectId.optional(),
    block: objectId.optional(),
    village: objectId.optional(),
    vehicleType: vehicleType.optional(),
    q: z.string().trim().optional(),
  }),
  params: z.object({}).optional(),
  body: z.any().optional(),
});

export const createTaxiSchema = z.object({
  body: taxiBody,
  query: z.any().optional(),
  params: z.object({}).optional(),
});

export const updateTaxiSchema = z.object({
  body: taxiBody.partial(),
  params: z.object({ id: objectId }),
  query: z.any().optional(),
});
