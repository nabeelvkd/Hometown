import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate';
import { requireAuth, requireRole, optionalAuth } from '../middlewares/auth';
import { restrictToOwnVillage, scopeReadsToOwnVillage } from '../middlewares/villageScope';
import { USER_ROLES } from '../constants';
import { Announcement } from '../models';
import { idParam } from '../validators/common';
import {
  listAnnouncementsSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from '../validators/announcement.validator';
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcement.controller';

const router = Router();

const manager = requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.LOCAL_ADMIN);

router.get(
  '/',
  optionalAuth,
  asyncHandler(scopeReadsToOwnVillage),
  validate(listAnnouncementsSchema),
  asyncHandler(listAnnouncements)
);

router.post(
  '/',
  requireAuth,
  manager,
  validate(createAnnouncementSchema),
  restrictToOwnVillage(),
  asyncHandler(createAnnouncement)
);
router.put(
  '/:id',
  requireAuth,
  manager,
  validate(updateAnnouncementSchema),
  restrictToOwnVillage(Announcement),
  asyncHandler(updateAnnouncement)
);
router.delete(
  '/:id',
  requireAuth,
  manager,
  validate(idParam),
  restrictToOwnVillage(Announcement),
  asyncHandler(deleteAnnouncement)
);

export default router;
