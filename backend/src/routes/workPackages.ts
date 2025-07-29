import { Router } from 'express';
import { WorkPackagesController } from '../controllers/workPackagesController';
import { validateTimeRange } from '../middleware/validation';

const router = Router();

// GET /api/work-packages - Get work packages within time range
router.get('/', validateTimeRange, WorkPackagesController.getWorkPackages);

export { router as workPackagesRouter };
