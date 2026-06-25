import { z } from 'zod';
import { objectId } from './common';

/**
 * /api/home is village-first: villageId is the primary scope. districtId and
 * blockId are accepted for broader views. At least one must be provided.
 */
export const homeSchema = z.object({
  query: z
    .object({
      villageId: objectId.optional(),
      districtId: objectId.optional(),
      blockId: objectId.optional(),
    })
    .refine((q) => q.villageId || q.districtId || q.blockId, {
      message: 'Provide at least villageId, districtId or blockId',
    }),
  params: z.object({}).optional(),
  body: z.any().optional(),
});
