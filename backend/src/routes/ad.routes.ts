import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate';
import { requireAuth, requireRole } from '../middlewares/auth';
import { USER_ROLES } from '../constants';
import { idParam } from '../validators/common';
import {
  listAdsSchema,
  createAdSchema,
  updateAdSchema,
  reviewAdSchema,
  publicAdsSchema,
} from '../validators/ad.validator';
import {
  listPublicAds,
  listAds,
  createAd,
  updateAd,
  reviewAd,
  deleteAd,
} from '../controllers/ad.controller';

const router = Router();

const manager = requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.LOCAL_ADMIN);

// Public — mobile app fetches live, approved ads for a village.
router.get('/public', validate(publicAdsSchema), asyncHandler(listPublicAds));

// Admin listing + create (super_admin or local_admin).
router.get('/', requireAuth, manager, validate(listAdsSchema), asyncHandler(listAds));
router.post('/', requireAuth, manager, validate(createAdSchema), asyncHandler(createAd));
router.put('/:id', requireAuth, manager, validate(updateAdSchema), asyncHandler(updateAd));

// Approve / reject / toggle — super_admin only.
router.put(
  '/:id/review',
  requireAuth,
  requireRole(USER_ROLES.SUPER_ADMIN),
  validate(reviewAdSchema),
  asyncHandler(reviewAd)
);

router.delete('/:id', requireAuth, manager, validate(idParam), asyncHandler(deleteAd));

export default router;
