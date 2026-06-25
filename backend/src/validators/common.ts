import { z } from 'zod';

/** A MongoDB ObjectId as a 24-char hex string. */
export const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

/** Indian 10-digit mobile (optionally +91 prefixed). */
export const phone = z
  .string()
  .trim()
  .regex(/^(\+91[- ]?)?[6-9]\d{9}$/, 'Invalid phone number');

/**
 * Lenient phone for emergency contacts: also accepts short codes (100, 108)
 * and landline numbers (e.g. 04952210100). 3–15 digits, optional + prefix.
 */
export const flexiblePhone = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9\s-]{2,14}$/, 'Invalid phone number');

/** Pagination params shared across list endpoints. */
export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/** [lng, lat] tuple for GeoJSON points. */
export const coordinates = z
  .tuple([
    z.number().min(-180).max(180),
    z.number().min(-90).max(90),
  ])
  .optional();

export const idParam = z.object({
  params: z.object({ id: objectId }),
  query: z.any().optional(),
  body: z.any().optional(),
});
