import { Router } from 'express';
import { HealthController } from '../controller/healthController.js';
import { ChallengeController } from '../controller/challengeController.js';
import { SharkTankController } from '../controller/sharkTankController.js';
import { createHealthRouter } from './healthRouter.js';
import { createChallengeRouter } from './challengeRouter.js';
import { createSharkTankRouter } from './sharkTankRouter.js';

export interface AppControllers {
  healthController: HealthController;
  challengeController: ChallengeController;
  sharkTankController: SharkTankController;
}

export function createApiRouter(controllers: AppControllers): Router {
  const router = Router();
  router.use(createHealthRouter(controllers.healthController));
  router.use(createChallengeRouter(controllers.challengeController));
  router.use(createSharkTankRouter(controllers.sharkTankController));
  return router;
}
