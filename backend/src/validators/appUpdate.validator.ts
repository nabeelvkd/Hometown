import { z } from 'zod';

export const checkUpdateSchema = z.object({
  body: z.any().optional(),
  query: z.object({
    platform: z.string().optional(),
    version: z.string().optional(),
  }),
  params: z.object({}).optional(),
});

const optionalUrl = z.string().trim().url().or(z.literal('')).optional();

export const setUpdateSchema = z.object({
  body: z.object({
    latestVersion: z
      .string()
      .trim()
      .regex(/^\d+(\.\d+){0,3}$/, 'Use a dotted version like 1.2.0')
      .optional(),
    androidUrl: optionalUrl,
    iosUrl: optionalUrl,
    title: z.string().trim().max(120).optional(),
    message: z.string().trim().max(500).optional(),
    mandatory: z.boolean().optional(),
    active: z.boolean().optional(),
  }),
  query: z.any().optional(),
  params: z.object({}).optional(),
});
