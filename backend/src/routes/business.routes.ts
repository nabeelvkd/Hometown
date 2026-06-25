import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate';
import { requireAuth, requireRole, optionalAuth } from '../middlewares/auth';
import { restrictToOwnVillage, scopeReadsToOwnVillage } from '../middlewares/villageScope';
import { USER_ROLES } from '../constants';
import { Business } from '../models';
import { idParam } from '../validators/common';
import {
  listBusinessesSchema,
  createBusinessSchema,
  updateBusinessSchema,
} from '../validators/business.validator';
import {
  listBusinesses,
  getBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
} from '../controllers/business.controller';

const router = Router();

const manager = requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.LOCAL_ADMIN);

router.get(
  '/',
  optionalAuth,
  asyncHandler(scopeReadsToOwnVillage),
  validate(listBusinessesSchema),
  asyncHandler(listBusinesses)
);
router.get('/:id', validate(idParam), asyncHandler(getBusiness));

router.post(
  '/',
  requireAuth,
  manager,
  validate(createBusinessSchema),
  restrictToOwnVillage(),
  asyncHandler(createBusiness)
);
router.put(
  '/:id',
  requireAuth,
  manager,
  validate(updateBusinessSchema),
  restrictToOwnVillage(Business),
  asyncHandler(updateBusiness)
);
router.delete(
  '/:id',
  requireAuth,
  manager,
  validate(idParam),
  restrictToOwnVillage(Business),
  asyncHandler(deleteBusiness)
);

export default router;
