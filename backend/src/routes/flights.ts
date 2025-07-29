import { Router } from 'express';
import { FlightsController } from '../controllers/flightsController';
import { validateTimeRange } from '../middleware/validation';

const router = Router();

// GET /api/flights - Get flights within time range
router.get('/', validateTimeRange, FlightsController.getFlights);

export { router as flightsRouter };
