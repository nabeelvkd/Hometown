import { Request, Response } from 'express';
import { User } from '../models';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { USER_ROLES } from '../constants';
import { resolveVillageLocation } from '../services/location.service';

function publicUser(user: {
  _id: unknown;
  name: string;
  phone: string;
  email?: string;
  role: string;
  district?: unknown;
  block?: unknown;
  village?: unknown;
  isActive: boolean;
}) {
  return {
    id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    district: user.district,
    block: user.block,
    village: user.village,
    isActive: user.isActive,
  };
}

/**
 * Creates the dedicated Local Admin for a village. Enforces the ownership
 * model: one village = one local admin. super_admin only.
 */
export const createLocalAdmin = async (req: Request, res: Response) => {
  const { name, phone, email, password, village } = req.body;

  const loc = await resolveVillageLocation(village);

  const existingAdmin = await User.findOne({
    role: USER_ROLES.LOCAL_ADMIN,
    village: loc.village,
  });
  if (existingAdmin) {
    throw ApiError.conflict('This village already has a local admin');
  }

  const phoneTaken = await User.findOne({ phone });
  if (phoneTaken) throw ApiError.conflict('Phone number already registered');

  const user = new User({
    name,
    phone,
    email,
    role: USER_ROLES.LOCAL_ADMIN,
    district: loc.district,
    block: loc.block,
    village: loc.village,
  });
  await user.setPassword(password);
  await user.save();

  sendSuccess(res, publicUser(user), 201);
};

/**
 * Lists admins, optionally filtered by role/village. super_admin only.
 */
export const listAdmins = async (req: Request, res: Response) => {
  const { role, village } = req.query as { role?: string; village?: string };
  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  else filter.role = { $in: [USER_ROLES.LOCAL_ADMIN, USER_ROLES.SUPER_ADMIN] };
  if (village) filter.village = village;

  const users = await User.find(filter)
    .populate('village', 'name nameMl')
    .sort({ createdAt: -1 });
  sendSuccess(res, users.map(publicUser));
};

/**
 * Resets a local admin's password / toggles active. super_admin only.
 */
export const updateLocalAdmin = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role !== USER_ROLES.LOCAL_ADMIN) {
    throw ApiError.badRequest('Only local admins can be edited here');
  }

  const { name, password, isActive } = req.body;
  if (name !== undefined) user.name = name;
  if (isActive !== undefined) user.isActive = isActive;
  if (password) await user.setPassword(password);
  await user.save();

  sendSuccess(res, publicUser(user));
};
