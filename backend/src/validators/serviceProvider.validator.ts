import { z } from 'zod';
import { objectId, phone, paginationQuery } from './common';

/** Category is free text (lowercased server-side) so admins can add their own. */
const category = z.string().trim().min(1).max(60);

const providerBody = z.object({
  name: z.string().trim().min(1).max(200),
  nameMl: z.string().trim().max(200).optional(),
  category,
  phone,
  whatsapp: phone.optional(),
  photo: z.string().trim().url().optional(),
  experienceYears: z.number().int().min(0).max(80).optional(),
  description: z.string().trim().max(2000).optional(),
  // district/block are derived from the village server-side.
  village: objectId,
  isVerified: z.boolean().optional(),
});

export const listProvidersSchema = z.object({
  query: paginationQuery.extend({
    district: objectId.optional(),
    block: objectId.optional(),
    village: objectId.optional(),
    category: category.optional(),
    verified: z.coerce.boolean().optional(),
    q: z.string().trim().optional(),
  }),
  params: z.object({}).optional(),
  body: z.any().optional(),
});

export const createProviderSchema = z.object({
  body: providerBody,
  query: z.any().optional(),
  params: z.object({}).optional(),
});

export const updateProviderSchema = z.object({
  body: providerBody.partial(),
  params: z.object({ id: objectId }),
  query: z.any().optional(),
});
