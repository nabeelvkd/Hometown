import { Request, Response } from 'express';
import { User } from '../models';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { signToken } from '../middlewares/auth';

function publicUser(user: {
  _id: unknown;
  name: string;
  phone: string;
  email?: string;
  role: string;
  preferredLanguage: string;
  district?: unknown;
  block?: unknown;
  village?: unknown;
}) {
  return {
    id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    preferredLanguage: user.preferredLanguage,
    district: user.district,
    block: user.block,
    village: user.village,
  };
}

export const register = async (req: Request, res: Response) => {
  const { password, ...rest } = req.body;

  const existing = await User.findOne({ phone: rest.phone });
  if (existing) throw ApiError.conflict('Phone number already registered');

  const user = new User(rest);
  await user.setPassword(password);
  await user.save();

  const token = signToken({ sub: user._id.toString(), role: user.role });
  sendSuccess(res, { token, user: publicUser(user) }, 201);
};

export const login = async (req: Request, res: Response) => {
  const { phone, password } = req.body;

  const user = await User.findOne({ phone }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid phone or password');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been disabled. Contact the super admin.');
  }

  const token = signToken({ sub: user._id.toString(), role: user.role });
  sendSuccess(res, { token, user: publicUser(user) });
};

export const me = async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.sub);
  if (!user) throw ApiError.notFound('User not found');
  sendSuccess(res, publicUser(user));
};
