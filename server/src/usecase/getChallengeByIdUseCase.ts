import { Challenge } from '../domain/challenge.js';
import { IChallengeRepository } from '../repository/challengeRepository.interface.js';

export class GetChallengeByIdUseCase {
  constructor(private readonly challengeRepository: IChallengeRepository) {}

  execute(id: string): Challenge | null {
    if (!id || typeof id !== 'string') {
      return null;
    }
    return this.challengeRepository.findById(id);
  }
}
