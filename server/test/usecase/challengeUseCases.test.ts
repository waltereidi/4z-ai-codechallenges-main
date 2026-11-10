import { describe, it, expect } from 'vitest';
import { InMemoryChallengeRepository } from '../../src/repository/inMemoryChallengeRepository.js';
import { GetChallengesUseCase } from '../../src/usecase/getChallengesUseCase.js';
import { GetChallengeByIdUseCase } from '../../src/usecase/getChallengeByIdUseCase.js';

describe('Challenge Use Cases', () => {
  const customChallenges = [
    {
      id: 'challenge-1',
      title: 'Challenge 1',
      category: 'Simulação',
      difficulty: 'Fácil' as const,
      type: 'basic',
      description: 'Desc 1'
    },
    {
      id: 'challenge-2',
      title: 'Challenge 2',
      category: 'Concorrência',
      difficulty: 'Difícil' as const,
      type: 'threads',
      description: 'Desc 2'
    }
  ];

  it('GetChallengesUseCase should return all challenges from repository', () => {
    const repo = new InMemoryChallengeRepository(customChallenges);
    const useCase = new GetChallengesUseCase(repo);

    const result = useCase.execute();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('challenge-1');
  });

  it('GetChallengeByIdUseCase should return the correct challenge by ID', () => {
    const repo = new InMemoryChallengeRepository(customChallenges);
    const useCase = new GetChallengeByIdUseCase(repo);

    const result = useCase.execute('challenge-2');
    expect(result).not.toBeNull();
    expect(result?.title).toBe('Challenge 2');
  });

  it('GetChallengeByIdUseCase should return null for non-existing challenge', () => {
    const repo = new InMemoryChallengeRepository(customChallenges);
    const useCase = new GetChallengeByIdUseCase(repo);

    const result = useCase.execute('non-existent');
    expect(result).toBeNull();
  });
});
