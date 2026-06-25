import { z } from 'zod';
import { objectId, phone } from './common';

export const createLocalAdminSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(120),
    phone,
    email: z.string().trim().email().optional(),
    password: z.string().min(6).max(128),
    village: objectId,
  }),
  query: z.any().optional(),
  params: z.object({}).optional(),
});

export const listAdminsSchema = z.object({
  query: z.object({
    role: z.string().optional(),
    village: objectId.optional(),
  }),
  params: z.object({}).optional(),
  body: z.any().optional(),
});

export const updateLocalAdminSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(120).optional(),
    password: z.string().min(6).max(128).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({ id: objectId }),
  query: z.any().optional(),
});
