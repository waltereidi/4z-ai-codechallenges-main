import { Router } from 'express';
import { ChallengeController } from '../controller/challengeController.js';

export function createChallengeRouter(controller: ChallengeController): Router {
  const router = Router();
  router.get('/challenges', controller.getAll);
  router.get('/challenges/:id', controller.getById);
  return router;
}
