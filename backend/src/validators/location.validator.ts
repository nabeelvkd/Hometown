import { z } from 'zod';
import { BLOCK_TYPE_VALUES } from '../constants';
import { objectId } from './common';

export const createDistrictSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(120),
    nameMl: z.string().trim().max(120).optional(),
    state: z.string().trim().max(120).optional(),
    code: z.string().trim().max(10).optional(),
  }),
  query: z.any().optional(),
  params: z.object({}).optional(),
});

export const createBlockSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(120),
    nameMl: z.string().trim().max(120).optional(),
    district: objectId,
    type: z.enum(BLOCK_TYPE_VALUES as [string, ...string[]]).optional(),
  }),
  query: z.any().optional(),
  params: z.object({}).optional(),
});

export const listBlocksSchema = z.object({
  query: z.object({ district: objectId.optional() }),
  params: z.object({}).optional(),
  body: z.any().optional(),
});

export const createVillageSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(120),
    nameMl: z.string().trim().max(120).optional(),
    block: objectId,
  }),
  query: z.any().optional(),
  params: z.object({}).optional(),
});

export const listVillagesSchema = z.object({
  query: z.object({
    block: objectId.optional(),
    district: objectId.optional(),
  }),
  params: z.object({}).optional(),
  body: z.any().optional(),
});

export const updateVillageSchema = z.object({
  body: z.object({
    heroImage: z.string().trim().url().or(z.literal('')).optional(),
    name: z.string().trim().min(1).max(120).optional(),
    nameMl: z.string().trim().max(120).optional(),
    block: objectId.optional(), // move the village to another area/block
  }),
  params: z.object({ id: objectId }),
  query: z.any().optional(),
});
