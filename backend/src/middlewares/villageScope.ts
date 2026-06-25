import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import { User } from '../models';
import { ApiError } from '../utils/ApiError';
import { USER_ROLES } from '../constants';

/**
 * Enforces the ownership model: a local_admin may only create, edit or delete
 * content within their own assigned village. super_admin is unrestricted.
 *
 * Must run after `requireAuth` and a `requireRole(SUPER_ADMIN, LOCAL_ADMIN)`.
 *
 * @param model Pass the target model for update/delete routes so the existing
 *   document's village can be checked. Omit for create routes (village is read
 *   from the request body).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function restrictToOwnVillage(model?: Model<any>) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return next(ApiError.unauthorized());
      if (req.user.role === USER_ROLES.SUPER_ADMIN) return next();
      if (req.user.role !== USER_ROLES.LOCAL_ADMIN) {
        return next(ApiError.forbidden('Insufficient permissions'));
      }

      const admin = await User.findById(req.user.sub).select('village');
      if (!admin?.village) {
        return next(ApiError.forbidden('No village is assigned to this admin'));
      }
      const adminVillage = admin.village.toString();

      // For update/delete: the existing document must belong to their village.
      if (model && req.params.id) {
        const doc = await model.findById(req.params.id).select('village');
        if (!doc) return next(ApiError.notFound());
        if (String(doc.village) !== adminVillage) {
          return next(ApiError.forbidden('You can only manage your own village'));
        }
      }

      // For create / re-assignment: the requested village must be their own.
      if (req.body?.village && req.body.village !== adminVillage) {
        return next(ApiError.forbidden('You can only manage your own village'));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * For list/read endpoints: if the requester is an authenticated local_admin,
 * force the query to their own village (ignoring any district/block/village
 * supplied by the client). Anonymous requests (the mobile app) and super_admins
 * are unaffected. Must run after `optionalAuth`.
 */
export async function scopeReadsToOwnVillage(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.user?.role === USER_ROLES.LOCAL_ADMIN) {
      const admin = await User.findById(req.user.sub).select('village');
      if (!admin?.village) {
        return next(ApiError.forbidden('No village is assigned to this admin'));
      }
      const q = req.query as Record<string, unknown>;
      q.village = String(admin.village);
      delete q.district;
      delete q.block;
    }
    next();
  } catch (err) {
    next(err);
  }
}
