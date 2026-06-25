import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate';
import { requireAuth, requireRole, optionalAuth } from '../middlewares/auth';
import { restrictToOwnVillage, scopeReadsToOwnVillage } from '../middlewares/villageScope';
import { USER_ROLES } from '../constants';
import { BusTrip } from '../models';
import { idParam } from '../validators/common';
import {
  listBusTripsSchema,
  createBusTripSchema,
  updateBusTripSchema,
} from '../validators/busTrip.validator';
import {
  listBusTrips,
  createBusTrip,
  updateBusTrip,
  deleteBusTrip,
} from '../controllers/busTrip.controller';

const router = Router();

const manager = requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.LOCAL_ADMIN);

router.get(
  '/',
  optionalAuth,
  asyncHandler(scopeReadsToOwnVillage),
  validate(listBusTripsSchema),
  asyncHandler(listBusTrips)
);

router.post('/', requireAuth, manager, validate(createBusTripSchema), restrictToOwnVillage(), asyncHandler(createBusTrip));
router.put(
  '/:id',
  requireAuth,
  manager,
  validate(updateBusTripSchema),
  restrictToOwnVillage(BusTrip),
  asyncHandler(updateBusTrip)
);
router.delete('/:id', requireAuth, manager, validate(idParam), restrictToOwnVillage(BusTrip), asyncHandler(deleteBusTrip));

export default router;
