import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate';
import { requireAuth, requireRole, optionalAuth } from '../middlewares/auth';
import { restrictToOwnVillage, scopeReadsToOwnVillage } from '../middlewares/villageScope';
import { USER_ROLES } from '../constants';
import { EmergencyContact } from '../models';
import { idParam } from '../validators/common';
import {
  listEmergencySchema,
  createEmergencySchema,
  updateEmergencySchema,
} from '../validators/emergency.validator';
import {
  listEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from '../controllers/emergency.controller';

const router = Router();

const manager = requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.LOCAL_ADMIN);

router.get(
  '/',
  optionalAuth,
  asyncHandler(scopeReadsToOwnVillage),
  validate(listEmergencySchema),
  asyncHandler(listEmergencyContacts)
);

router.post(
  '/',
  requireAuth,
  manager,
  validate(createEmergencySchema),
  restrictToOwnVillage(),
  asyncHandler(createEmergencyContact)
);
router.put(
  '/:id',
  requireAuth,
  manager,
  validate(updateEmergencySchema),
  restrictToOwnVillage(EmergencyContact),
  asyncHandler(updateEmergencyContact)
);
router.delete(
  '/:id',
  requireAuth,
  manager,
  validate(idParam),
  restrictToOwnVillage(EmergencyContact),
  asyncHandler(deleteEmergencyContact)
);

export default router;
