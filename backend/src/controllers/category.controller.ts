import { Request, Response } from 'express';
import { Category } from '../models';
import { sendSuccess } from '../utils/response';

export const listCategories = async (req: Request, res: Response) => {
  const { kind } = req.query as { kind?: string };
  const filter: Record<string, unknown> = { isActive: true };
  if (kind) filter.kind = kind;
  const categories = await Category.find(filter).sort({ order: 1, name: 1 });
  sendSuccess(res, categories);
};
