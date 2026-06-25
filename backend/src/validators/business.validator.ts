import { z } from 'zod';
import { objectId, phone, paginationQuery, coordinates } from './common';

/** Category is free text (lowercased server-side) so admins can add their own. */
const category = z.string().trim().min(1).max(60);

const businessBody = z.object({
  name: z.string().trim().min(1).max(200),
  nameMl: z.string().trim().max(200).optional(),
  category,
  phone,
  whatsapp: phone.optional(),
  acceptsOrders: z.boolean().optional(),
  address: z.string().trim().min(1).max(500),
  photos: z.array(z.string().trim().url()).max(10).optional(),
  workingHours: z.string().trim().max(200).optional(),
  coordinates,
  // district/block are derived from the village server-side.
  village: objectId,
  description: z.string().trim().max(2000).optional(),
  isVerified: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export const listBusinessesSchema = z.object({
  query: paginationQuery.extend({
    district: objectId.optional(),
    block: objectId.optional(),
    village: objectId.optional(),
    category: category.optional(),
    featured: z.coerce.boolean().optional(),
    verified: z.coerce.boolean().optional(),
    q: z.string().trim().optional(),
  }),
  params: z.object({}).optional(),
  body: z.any().optional(),
});

export const createBusinessSchema = z.object({
  body: businessBody,
  query: z.any().optional(),
  params: z.object({}).optional(),
});

export const updateBusinessSchema = z.object({
  body: businessBody.partial(),
  params: z.object({ id: objectId }),
  query: z.any().optional(),
});
