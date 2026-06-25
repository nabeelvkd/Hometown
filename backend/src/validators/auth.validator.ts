import { z } from 'zod';
import { objectId, phone } from './common';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(120),
    phone,
    email: z.string().trim().email().optional(),
    password: z.string().min(6).max(128),
    district: objectId.optional(),
    block: objectId.optional(),
    village: objectId.optional(),
    preferredLanguage: z.enum(['en', 'ml']).optional(),
  }),
  query: z.any().optional(),
  params: z.object({}).optional(),
});

export const loginSchema = z.object({
  body: z.object({
    phone,
    password: z.string().min(1),
  }),
  query: z.any().optional(),
  params: z.object({}).optional(),
});
