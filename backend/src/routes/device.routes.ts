import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate';
import { requireAuth, requireRole } from '../middlewares/auth';
import { USER_ROLES } from '../constants';
import { pingDeviceSchema, deviceStatsSchema } from '../validators/device.validator';
import { pingDevice, deviceStats } from '../controllers/device.controller';

const router = Router();

// Public — anonymous app device ping (for unique-user counts).
router.post('/ping', validate(pingDeviceSchema), asyncHandler(pingDevice));

// super_admin — unique users per village.
router.get(
  '/stats',
  requireAuth,
  requireRole(USER_ROLES.SUPER_ADMIN),
  validate(deviceStatsSchema),
  asyncHandler(deviceStats)
);

export default router;
