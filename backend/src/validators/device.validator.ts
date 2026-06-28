import { z } from 'zod';
import { objectId } from './common';

export const pingDeviceSchema = z.object({
  body: z.object({
    deviceId: z.string().trim().min(6).max(128),
    village: objectId.optional(),
  }),
  query: z.any().optional(),
  params: z.object({}).optional(),
});

export const deviceStatsSchema = z.object({
  query: z.object({ district: objectId.optional() }),
  params: z.object({}).optional(),
  body: z.any().optional(),
});
