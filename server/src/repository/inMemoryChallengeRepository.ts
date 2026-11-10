import { Challenge } from '../domain/challenge.js';
import { IChallengeRepository } from './challengeRepository.interface.js';

export class InMemoryChallengeRepository implements IChallengeRepository {
  private challenges: Challenge[] = [
    {
      id: 'ocean-sharks-multithread',
      title: 'Shark Tank',
      category: 'Simulação',
      difficulty: 'Médio',
      type: 'simulation_multithread',
      description: 'Avalie o comportamento do jogo e identifique problemas.'
    }
  ];

  constructor(customChallenges?: Challenge[]) {
    if (customChallenges) {
      this.challenges = customChallenges;
    }
  }

  findAll(): Challenge[] {
    return [...this.challenges];
  }

  findById(id: string): Challenge | null {
    const found = this.challenges.find(c => c.id === id);
    return found ? { ...found } : null;
  }
}
