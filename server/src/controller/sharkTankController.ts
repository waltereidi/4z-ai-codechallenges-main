import { Request, Response } from 'express';
import { CreateFishUseCase } from '../usecase/createFishUseCase.js';
import { EatFishUseCase } from '../usecase/eatFishUseCase.js';
import { GetTankStatsUseCase } from '../usecase/getTankStatsUseCase.js';
import { ResetTankUseCase } from '../usecase/resetTankUseCase.js';

export class SharkTankController {
  constructor(
    private readonly createFishUseCase: CreateFishUseCase,
    private readonly eatFishUseCase: EatFishUseCase,
    private readonly getTankStatsUseCase: GetTankStatsUseCase,
    private readonly resetTankUseCase: ResetTankUseCase
  ) {}

  createFish = (req: Request, res: Response): void => {
    try {
      const result = this.createFishUseCase.execute(req.body);
      res.json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid fish payload'
      });
    }
  };

  eatFish = (req: Request, res: Response): void => {
    try {
      const result = this.eatFishUseCase.execute(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record eaten fish'
      });
    }
  };

  getStats = (_req: Request, res: Response): void => {
    try {
      const stats = this.getTankStatsUseCase.execute();
      res.json(stats);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to retrieve stats'
      });
    }
  };

  reset = (_req: Request, res: Response): void => {
    try {
      const result = this.resetTankUseCase.execute();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset tank'
      });
    }
  };
}
