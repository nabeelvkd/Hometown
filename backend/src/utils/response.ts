import { Response } from 'express';

/**
 * Consistent success envelope used by every controller so the mobile/admin
 * clients can rely on a stable response shape.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown>
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}
