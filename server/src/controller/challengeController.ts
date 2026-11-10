import { Request, Response } from 'express';
import { GetChallengesUseCase } from '../usecase/getChallengesUseCase.js';
import { GetChallengeByIdUseCase } from '../usecase/getChallengeByIdUseCase.js';

export class ChallengeController {
  constructor(
    private readonly getChallengesUseCase: GetChallengesUseCase,
    private readonly getChallengeByIdUseCase: GetChallengeByIdUseCase
  ) {}

  getAll = (_req: Request, res: Response): void => {
    const challenges = this.getChallengesUseCase.execute();
    res.json(challenges);
  };

  getById = (req: Request, res: Response): void => {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const challenge = this.getChallengeByIdUseCase.execute(id);
    res.json(challenge);
  };
}
