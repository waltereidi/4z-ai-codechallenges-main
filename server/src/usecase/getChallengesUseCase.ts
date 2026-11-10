import { Challenge } from '../domain/challenge.js';
import { IChallengeRepository } from '../repository/challengeRepository.interface.js';

export class GetChallengesUseCase {
  constructor(private readonly challengeRepository: IChallengeRepository) {}

  execute(): Challenge[] {
    return this.challengeRepository.findAll();
  }
}
