import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate';
import { requireAuth, requireRole } from '../middlewares/auth';
import { USER_ROLES } from '../constants';
import { idParam } from '../validators/common';
import {
  listHomeCategoriesSchema,
  createHomeCategorySchema,
  updateHomeCategorySchema,
  reorderHomeCategoriesSchema,
} from '../validators/homeCategory.validator';
import {
  listHomeCategories,
  adminListHomeCategories,
  createHomeCategory,
  updateHomeCategory,
  reorderHomeCategories,
  deleteHomeCategory,
} from '../controllers/homeCategory.controller';

const router = Router();

const manager = [requireAuth, requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.LOCAL_ADMIN)];

// Public — mobile home grid.
router.get('/', validate(listHomeCategoriesSchema), asyncHandler(listHomeCategories));

// Admin management.
router.get('/admin', ...manager, validate(listHomeCategoriesSchema), asyncHandler(adminListHomeCategories));
router.post('/', ...manager, validate(createHomeCategorySchema), asyncHandler(createHomeCategory));
router.put('/reorder', ...manager, validate(reorderHomeCategoriesSchema), asyncHandler(reorderHomeCategories));
router.put('/:id', ...manager, validate(updateHomeCategorySchema), asyncHandler(updateHomeCategory));
router.delete('/:id', ...manager, validate(idParam), asyncHandler(deleteHomeCategory));

export default router;
