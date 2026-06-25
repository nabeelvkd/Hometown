import { z } from 'zod';
import { ANNOUNCEMENT_TYPE_VALUES } from '../constants';
import { objectId, paginationQuery } from './common';

const announcementBody = z.object({
  title: z.string().trim().min(1).max(300),
  titleMl: z.string().trim().max(300).optional(),
  body: z.string().trim().min(1).max(5000),
  bodyMl: z.string().trim().max(5000).optional(),
  type: z.enum(ANNOUNCEMENT_TYPE_VALUES as [string, ...string[]]).optional(),
  // district/block are derived from the village server-side.
  village: objectId,
  isPinned: z.boolean().optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
});

export const listAnnouncementsSchema = z.object({
  query: paginationQuery.extend({
    district: objectId.optional(),
    block: objectId.optional(),
    village: objectId.optional(),
    type: z.enum(ANNOUNCEMENT_TYPE_VALUES as [string, ...string[]]).optional(),
  }),
  params: z.object({}).optional(),
  body: z.any().optional(),
});

export const createAnnouncementSchema = z.object({
  body: announcementBody,
  query: z.any().optional(),
  params: z.object({}).optional(),
});

export const updateAnnouncementSchema = z.object({
  body: announcementBody.partial(),
  params: z.object({ id: objectId }),
  query: z.any().optional(),
});
