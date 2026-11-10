import { describe, it, expect, vi } from 'vitest';
import { GetChallengesUseCase } from '../../src/usecase/getChallengesUseCase.js';
import { IChallengeRepository } from '../../src/repository/challengeRepository.interface.js';
import { Challenge } from '../../src/domain/challenge.js';

describe('GetChallengesUseCase', () => {
  const challengesList: Challenge[] = [
    {
      id: 'c1',
      title: 'Desafio 1',
      category: 'Algoritmos',
      difficulty: 'Fácil',
      type: 'code'
    },
    {
      id: 'c2',
      title: 'Desafio 2',
      category: 'Concorrência',
      difficulty: 'Médio',
      type: 'threads'
    }
  ];

  const createMockChallengeRepo = (): IChallengeRepository => ({
    findAll: vi.fn(),
    findById: vi.fn()
  });

  // Cenário de sucesso
  it('deve retornar todos os desafios fornecidos pelo repositório', () => {
    const repo = createMockChallengeRepo();
    vi.mocked(repo.findAll).mockReturnValue(challengesList);

    const useCase = new GetChallengesUseCase(repo);
    const result = useCase.execute();

    expect(result).toEqual(challengesList);
    expect(result).toHaveLength(2);
    expect(repo.findAll).toHaveBeenCalledTimes(1);
  });

  // Regra de negócio: lista vazia
  it('deve retornar um array vazio quando não houver desafios cadastrados', () => {
    const repo = createMockChallengeRepo();
    vi.mocked(repo.findAll).mockReturnValue([]);

    const useCase = new GetChallengesUseCase(repo);
    const result = useCase.execute();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
    expect(repo.findAll).toHaveBeenCalledTimes(1);
  });

  // Cenário de erro
  it('deve propagar erro quando o repositório lançar uma exceção', () => {
    const repo = createMockChallengeRepo();
    vi.mocked(repo.findAll).mockImplementation(() => {
      throw new Error('Repository findAll failure');
    });

    const useCase = new GetChallengesUseCase(repo);

    expect(() => useCase.execute()).toThrow('Repository findAll failure');
  });

  // Fake repository test
  it('deve funcionar corretamente com repositório fake em memória', () => {
    const fakeRepo: IChallengeRepository = {
      findAll: () => challengesList,
      findById: (id: string) => challengesList.find(c => c.id === id) || null
    };

    const useCase = new GetChallengesUseCase(fakeRepo);
    const result = useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('c1');
  });
});
