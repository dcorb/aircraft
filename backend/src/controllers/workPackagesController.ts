import { Request, Response } from 'express';
import { WorkPackageService } from '../services/workPackageService';
import type { ValidatedRequest } from '../middleware/validation';
import type { ApiError } from '../models/types';

export class WorkPackagesController {
  static async getWorkPackages(req: Request, res: Response): Promise<void> {
    try {
      const { validatedQuery } = req as ValidatedRequest;
      const result =
        await WorkPackageService.getWorkPackagesByTimeRange(validatedQuery);
      res.json(result);
    } catch (error) {
      console.error('Controller error:', error);
      res
        .status(500)
        .json({ error: 'Failed to fetch work packages' } as ApiError);
    }
  }
}
