import { Router, Request, Response } from 'express';
import multer from 'multer';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth, requireRole } from '../middlewares/auth';
import { USER_ROLES } from '../constants';
import { ApiError } from '../utils/ApiError';
import { uploadImage, isCloudinaryConfigured } from '../config/cloudinary';
import { sendSuccess } from '../utils/response';

const router = Router();

// In-memory upload; 8 MB cap; images only.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

/**
 * Uploads an image to Cloudinary and returns its URL. Admins only.
 * The mobile/admin apps then apply size transforms on the returned URL.
 */
router.post(
  '/image',
  requireAuth,
  requireRole(USER_ROLES.SUPER_ADMIN, USER_ROLES.LOCAL_ADMIN),
  upload.single('image'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!isCloudinaryConfigured()) {
      throw ApiError.internal('Cloudinary is not configured (set CLOUDINARY_CLOUD_NAME).');
    }
    if (!req.file) throw ApiError.badRequest('No image file provided (field name: "image")');
    const result = await uploadImage(req.file.buffer);
    sendSuccess(res, result, 201);
  })
);

export default router;
