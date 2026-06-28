import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate';
import { requireAuth, requireRole } from '../middlewares/auth';
import { USER_ROLES } from '../constants';
import { idParam } from '../validators/common';
import {
  listEntriesSchema,
  createEntrySchema,
  updateEntrySchema,
} from '../validators/categoryEntry.validator';
import {
  listEntries,
  adminListEntries,
  createEntry,
  updateEntry,
  deleteEntry,
} from '../controllers/categoryEntry.controller';

const router = Router();

const manager = [requireAuth, requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.LOCAL_ADMIN)];

router.get('/', validate(listEntriesSchema), asyncHandler(listEntries));
router.get('/admin', ...manager, validate(listEntriesSchema), asyncHandler(adminListEntries));
router.post('/', ...manager, validate(createEntrySchema), asyncHandler(createEntry));
router.put('/:id', ...manager, validate(updateEntrySchema), asyncHandler(updateEntry));
router.delete('/:id', ...manager, validate(idParam), asyncHandler(deleteEntry));

export default router;
