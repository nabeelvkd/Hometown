import { z } from 'zod';
import { objectId } from './common';
import { AD_STATUS_VALUES } from '../models/Ad';

export const listAdsSchema = z.object({
  query: z.object({
    village: objectId.optional(),
    status: z.enum(AD_STATUS_VALUES as [string, ...string[]]).optional(),
    mine: z.coerce.boolean().optional(),
  }),
  params: z.object({}).optional(),
  body: z.any().optional(),
});

export const createAdSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(120),
    subtitle: z.string().trim().max(200).optional(),
    cta: z.string().trim().max(40).optional(),
    ctaUrl: z.string().trim().url().optional(),
    image: z.string().trim().url().optional(),
    village: objectId.optional(),
    expiresAt: z.coerce.date().optional(),
  }),
  query: z.any().optional(),
  params: z.object({}).optional(),
});

export const reviewAdSchema = z.object({
  body: z.object({
    status: z.enum(AD_STATUS_VALUES as [string, ...string[]]).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({ id: objectId }),
  query: z.any().optional(),
});

export const publicAdsSchema = z.object({
  query: z.object({ village: objectId.optional() }),
  params: z.object({}).optional(),
  body: z.any().optional(),
});
