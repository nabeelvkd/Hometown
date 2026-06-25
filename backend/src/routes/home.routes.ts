import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate';
import { homeSchema } from '../validators/home.validator';
import { getHome } from '../controllers/home.controller';
import { search } from '../controllers/search.controller';
import { listCategories } from '../controllers/category.controller';

const router = Router();

router.get('/home', validate(homeSchema), asyncHandler(getHome));
router.get('/search', asyncHandler(search));
router.get('/categories', asyncHandler(listCategories));

export default router;
