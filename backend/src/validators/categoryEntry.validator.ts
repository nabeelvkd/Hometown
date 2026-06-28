import { z } from 'zod';
import { objectId } from './common';

const entryBody = z.object({
  category: objectId,
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(120).optional(),
  photo: z.string().trim().url().optional(),
  phone: z.string().trim().max(20).optional(),
  whatsapp: z.string().trim().max(20).optional(),
  description: z.string().trim().max(2000).optional(),
  link: z.string().trim().url().optional(),
});

export const listEntriesSchema = z.object({
  query: z.object({ category: objectId }),
  params: z.object({}).optional(),
  body: z.any().optional(),
});

export const createEntrySchema = z.object({
  body: entryBody,
  query: z.any().optional(),
  params: z.object({}).optional(),
});

export const updateEntrySchema = z.object({
  body: entryBody.partial(),
  params: z.object({ id: objectId }),
  query: z.any().optional(),
});
