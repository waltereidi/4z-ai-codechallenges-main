import { Router } from 'express';
import { SharkTankController } from '../controller/sharkTankController.js';

export function createSharkTankRouter(controller: SharkTankController): Router {
  const router = Router();
  router.post('/shark-tank/fish', controller.createFish);
  router.post('/shark-tank/eat', controller.eatFish);
  router.get('/shark-tank/stats', controller.getStats);
  router.post('/shark-tank/reset', controller.reset);
  return router;
}
