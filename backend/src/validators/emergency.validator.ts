import { z } from 'zod';
import { EMERGENCY_TYPE_VALUES } from '../constants';
import { objectId, flexiblePhone } from './common';

const emergencyBody = z.object({
  name: z.string().trim().min(1).max(200),
  nameMl: z.string().trim().max(200).optional(),
  type: z.enum(EMERGENCY_TYPE_VALUES as [string, ...string[]]),
  phone: flexiblePhone,
  alternatePhone: flexiblePhone.optional(),
  address: z.string().trim().max(500).optional(),
  // district/block are derived from the village server-side.
  village: objectId,
  order: z.number().int().optional(),
});

export const listEmergencySchema = z.object({
  query: z.object({
    district: objectId.optional(),
    block: objectId.optional(),
    village: objectId.optional(),
    type: z.enum(EMERGENCY_TYPE_VALUES as [string, ...string[]]).optional(),
  }),
  params: z.object({}).optional(),
  body: z.any().optional(),
});

export const createEmergencySchema = z.object({
  body: emergencyBody,
  query: z.any().optional(),
  params: z.object({}).optional(),
});

export const updateEmergencySchema = z.object({
  body: emergencyBody.partial(),
  params: z.object({ id: objectId }),
  query: z.any().optional(),
});
