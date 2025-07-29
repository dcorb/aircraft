import { Request, Response } from 'express';
import { FlightService } from '../services/flightService';
import type { ValidatedRequest } from '../middleware/validation';
import type { ApiError } from '../models/types';

export class FlightsController {
  static async getFlights(req: Request, res: Response): Promise<void> {
    try {
      const { validatedQuery } = req as ValidatedRequest;
      const result = await FlightService.getFlightsByTimeRange(validatedQuery);
      res.json(result);
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({ error: 'Failed to fetch flights' } as ApiError);
    }
  }
}
