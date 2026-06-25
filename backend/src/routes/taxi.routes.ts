import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate';
import { requireAuth, requireRole, optionalAuth } from '../middlewares/auth';
import { restrictToOwnVillage, scopeReadsToOwnVillage } from '../middlewares/villageScope';
import { USER_ROLES } from '../constants';
import { Taxi } from '../models';
import { idParam } from '../validators/common';
import { listTaxisSchema, createTaxiSchema, updateTaxiSchema } from '../validators/taxi.validator';
import {
  listTaxis,
  getTaxi,
  createTaxi,
  updateTaxi,
  deleteTaxi,
} from '../controllers/taxi.controller';

const router = Router();

const manager = requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.LOCAL_ADMIN);

router.get(
  '/',
  optionalAuth,
  asyncHandler(scopeReadsToOwnVillage),
  validate(listTaxisSchema),
  asyncHandler(listTaxis)
);
router.get('/:id', validate(idParam), asyncHandler(getTaxi));

router.post('/', requireAuth, manager, validate(createTaxiSchema), restrictToOwnVillage(), asyncHandler(createTaxi));
router.put(
  '/:id',
  requireAuth,
  manager,
  validate(updateTaxiSchema),
  restrictToOwnVillage(Taxi),
  asyncHandler(updateTaxi)
);
router.delete('/:id', requireAuth, manager, validate(idParam), restrictToOwnVillage(Taxi), asyncHandler(deleteTaxi));

export default router;
