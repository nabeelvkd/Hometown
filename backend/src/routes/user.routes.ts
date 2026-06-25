import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate';
import { requireAuth, requireRole } from '../middlewares/auth';
import { USER_ROLES } from '../constants';
import {
  createLocalAdminSchema,
  listAdminsSchema,
  updateLocalAdminSchema,
} from '../validators/user.validator';
import {
  createLocalAdmin,
  listAdmins,
  updateLocalAdmin,
} from '../controllers/user.controller';

const router = Router();

// Managing admin accounts is a super_admin-only responsibility.
const superAdmin = [requireAuth, requireRole(USER_ROLES.SUPER_ADMIN)];

router.get('/', ...superAdmin, validate(listAdminsSchema), asyncHandler(listAdmins));
router.post(
  '/local-admins',
  ...superAdmin,
  validate(createLocalAdminSchema),
  asyncHandler(createLocalAdmin)
);
router.put(
  '/local-admins/:id',
  ...superAdmin,
  validate(updateLocalAdminSchema),
  asyncHandler(updateLocalAdmin)
);

export default router;
