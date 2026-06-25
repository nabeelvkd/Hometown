import { z } from 'zod';
import { objectId, paginationQuery } from './common';

const time = z
  .string()
  .trim()
  .regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Time must be HH:MM (24-hour)');

const busTripBody = z.object({
  destination: z.string().trim().min(1).max(80),
  time,
  operator: z.string().trim().min(1).max(120),
  number: z.string().trim().min(1).max(20),
  tags: z.array(z.string().trim().min(1).max(30)).max(6).optional(),
  village: objectId,
});

export const listBusTripsSchema = z.object({
  query: paginationQuery.extend({
    district: objectId.optional(),
    block: objectId.optional(),
    village: objectId.optional(),
    destination: z.string().trim().optional(),
    tag: z.string().trim().optional(),
  }),
  params: z.object({}).optional(),
  body: z.any().optional(),
});

export const createBusTripSchema = z.object({
  body: busTripBody,
  query: z.any().optional(),
  params: z.object({}).optional(),
});

export const updateBusTripSchema = z.object({
  body: busTripBody.partial(),
  params: z.object({ id: objectId }),
  query: z.any().optional(),
});
