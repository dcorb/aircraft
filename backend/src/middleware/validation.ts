import { Request, Response, NextFunction } from 'express';
import { validateTimeRangeQuery } from '../utils/validation';
import type { ApiError } from '../models/types';

export interface ValidatedRequest extends Request {
  validatedQuery: {
    startTime: string;
    endTime: string;
  };
}

export const validateTimeRange = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const validation = validateTimeRangeQuery(req.query);

  if (!validation.isValid) {
    res.status(400).json({ error: validation.error } as ApiError);
    return;
  }

  // Attach validated data to request
  (req as ValidatedRequest).validatedQuery = validation.data!;
  next();
};
