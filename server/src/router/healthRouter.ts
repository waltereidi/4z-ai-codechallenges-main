import { Router } from 'express';
import { HealthController } from '../controller/healthController.js';

export function createHealthRouter(controller: HealthController): Router {
  const router = Router();
  router.get('/health', controller.getHealth);
  return router;
}
