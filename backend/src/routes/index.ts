import { Router } from 'express';
import { flightsRouter } from './flights';
import { workPackagesRouter } from './workPackages';

const router = Router();

// Mount route modules
router.use('/flights', flightsRouter);
router.use('/work-packages', workPackagesRouter);

export { router as apiRoutes };
