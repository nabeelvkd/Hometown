import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate';
import { requireAuth, requireRole } from '../middlewares/auth';
import { USER_ROLES } from '../constants';
import { checkUpdateSchema, setUpdateSchema } from '../validators/appUpdate.validator';
import {
  checkUpdate,
  getUpdateConfig,
  setUpdateConfig,
} from '../controllers/appUpdate.controller';

const router = Router();
const superOnly = requireRole(USER_ROLES.SUPER_ADMIN);

// Public — mobile app checks for an update on launch.
router.get('/check', validate(checkUpdateSchema), asyncHandler(checkUpdate));

// super_admin — read / set the update config.
router.get('/', requireAuth, superOnly, asyncHandler(getUpdateConfig));
router.put('/', requireAuth, superOnly, validate(setUpdateSchema), asyncHandler(setUpdateConfig));

export default router;
