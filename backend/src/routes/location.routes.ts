import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate';
import { requireAuth, requireRole } from '../middlewares/auth';
import { USER_ROLES } from '../constants';
import {
  createDistrictSchema,
  createBlockSchema,
  listBlocksSchema,
  createVillageSchema,
  listVillagesSchema,
  updateVillageSchema,
} from '../validators/location.validator';
import {
  listDistricts,
  createDistrict,
  listBlocks,
  createBlock,
  listVillages,
  createVillage,
  getVillage,
  updateVillage,
} from '../controllers/location.controller';
import { idParam } from '../validators/common';

const router = Router();

// Managing the location hierarchy is a super_admin responsibility.
const superAdmin = requireRole(USER_ROLES.SUPER_ADMIN);

router.get('/districts', asyncHandler(listDistricts));
router.post(
  '/districts',
  requireAuth,
  superAdmin,
  validate(createDistrictSchema),
  asyncHandler(createDistrict)
);

router.get('/blocks', validate(listBlocksSchema), asyncHandler(listBlocks));
router.post(
  '/blocks',
  requireAuth,
  superAdmin,
  validate(createBlockSchema),
  asyncHandler(createBlock)
);

router.get('/villages', validate(listVillagesSchema), asyncHandler(listVillages));
router.get('/villages/:id', validate(idParam), asyncHandler(getVillage));
router.post(
  '/villages',
  requireAuth,
  superAdmin,
  validate(createVillageSchema),
  asyncHandler(createVillage)
);
// Hero image / names: super_admin (any) or local_admin (own village, enforced in controller).
router.put(
  '/villages/:id',
  requireAuth,
  requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.LOCAL_ADMIN),
  validate(updateVillageSchema),
  asyncHandler(updateVillage)
);

export default router;
