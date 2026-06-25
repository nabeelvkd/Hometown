import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate';
import { requireAuth, requireRole, optionalAuth } from '../middlewares/auth';
import { restrictToOwnVillage, scopeReadsToOwnVillage } from '../middlewares/villageScope';
import { USER_ROLES } from '../constants';
import { ServiceProvider } from '../models';
import { idParam } from '../validators/common';
import {
  listProvidersSchema,
  createProviderSchema,
  updateProviderSchema,
} from '../validators/serviceProvider.validator';
import {
  listProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
} from '../controllers/serviceProvider.controller';

const router = Router();

const manager = requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.LOCAL_ADMIN);

router.get(
  '/',
  optionalAuth,
  asyncHandler(scopeReadsToOwnVillage),
  validate(listProvidersSchema),
  asyncHandler(listProviders)
);
router.get('/:id', validate(idParam), asyncHandler(getProvider));

router.post(
  '/',
  requireAuth,
  manager,
  validate(createProviderSchema),
  restrictToOwnVillage(),
  asyncHandler(createProvider)
);
router.put(
  '/:id',
  requireAuth,
  manager,
  validate(updateProviderSchema),
  restrictToOwnVillage(ServiceProvider),
  asyncHandler(updateProvider)
);
router.delete(
  '/:id',
  requireAuth,
  manager,
  validate(idParam),
  restrictToOwnVillage(ServiceProvider),
  asyncHandler(deleteProvider)
);

export default router;
