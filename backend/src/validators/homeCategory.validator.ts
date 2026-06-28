import { z } from 'zod';
import { objectId } from './common';

export const listHomeCategoriesSchema = z.object({
  query: z.object({ village: objectId.optional() }),
  params: z.object({}).optional(),
  body: z.any().optional(),
});

export const createHomeCategorySchema = z.object({
  body: z.object({
    label: z.string().trim().min(1).max(40),
    sub: z.string().trim().max(60).optional(),
    icon: z.string().trim().min(1).max(40).optional(),
    color: z
      .string()
      .trim()
      .regex(/^#([0-9a-fA-F]{6})$/, 'Color must be a hex like #16A34A')
      .optional(),
    link: z.string().trim().url().optional(),
    template: z.enum(['link', 'directory', 'places']).optional(),
    // Optional: local admins derive it from their assignment; super admins pass it.
    village: objectId.optional(),
  }),
  query: z.any().optional(),
  params: z.object({}).optional(),
});

export const updateHomeCategorySchema = z.object({
  body: z.object({
    label: z.string().trim().min(1).max(40).optional(),
    sub: z.string().trim().max(60).optional(),
    icon: z.string().trim().min(1).max(40).optional(),
    color: z.string().trim().regex(/^#([0-9a-fA-F]{6})$/).optional(),
    link: z.string().trim().url().or(z.literal('')).optional(),
    template: z.enum(['link', 'directory', 'places']).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({ id: objectId }),
  query: z.any().optional(),
});

export const reorderHomeCategoriesSchema = z.object({
  body: z.object({
    village: objectId,
    ids: z.array(objectId).min(1),
  }),
  query: z.any().optional(),
  params: z.object({}).optional(),
});
