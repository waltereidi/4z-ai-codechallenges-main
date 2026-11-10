import { loadConfig } from './infrastructure/config.js';
import { initDatabase } from './infrastructure/database.js';
import { createApp } from './infrastructure/app.js';
import { createApiRouter } from './router/index.js';

import { InMemoryChallengeRepository } from './repository/inMemoryChallengeRepository.js';
import { SqliteFishRepository } from './repository/sqliteFishRepository.js';
import { SqliteEatenFishRepository } from './repository/sqliteEatenFishRepository.js';

import { GetChallengesUseCase } from './usecase/getChallengesUseCase.js';
import { GetChallengeByIdUseCase } from './usecase/getChallengeByIdUseCase.js';
import { CreateFishUseCase } from './usecase/createFishUseCase.js';
import { EatFishUseCase } from './usecase/eatFishUseCase.js';
import { GetTankStatsUseCase } from './usecase/getTankStatsUseCase.js';
import { ResetTankUseCase } from './usecase/resetTankUseCase.js';

import { HealthController } from './controller/healthController.js';
import { ChallengeController } from './controller/challengeController.js';
import { SharkTankController } from './controller/sharkTankController.js';

function bootstrap(): void {
  const config = loadConfig();
  const db = initDatabase(config.dbPath);

  // Repositories
  const challengeRepo = new InMemoryChallengeRepository();
  const fishRepo = new SqliteFishRepository(db);
  const eatenFishRepo = new SqliteEatenFishRepository(db);

  // Use Cases
  const getChallengesUseCase = new GetChallengesUseCase(challengeRepo);
  const getChallengeByIdUseCase = new GetChallengeByIdUseCase(challengeRepo);
  const createFishUseCase = new CreateFishUseCase(fishRepo);
  const eatFishUseCase = new EatFishUseCase(fishRepo, eatenFishRepo);
  const getTankStatsUseCase = new GetTankStatsUseCase(fishRepo, eatenFishRepo);
  const resetTankUseCase = new ResetTankUseCase(fishRepo, eatenFishRepo);

  // Controllers
  const healthController = new HealthController();
  const challengeController = new ChallengeController(getChallengesUseCase, getChallengeByIdUseCase);
  const sharkTankController = new SharkTankController(
    createFishUseCase,
    eatFishUseCase,
    getTankStatsUseCase,
    resetTankUseCase
  );

  // Router & App
  const apiRouter = createApiRouter({
    healthController,
    challengeController,
    sharkTankController
  });

  const app = createApp(apiRouter, config.corsOrigin);

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });

  if (config.altPort && String(config.altPort) !== String(config.port)) {
    app.listen(config.altPort, '0.0.0.0', () => {
      console.log(`Server also accessible on http://localhost:${config.altPort}`);
    });
  }
}

bootstrap();
