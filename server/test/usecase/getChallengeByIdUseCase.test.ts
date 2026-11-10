import { describe, it, expect, vi } from 'vitest';
import { GetChallengeByIdUseCase } from '../../src/usecase/getChallengeByIdUseCase.js';
import { IChallengeRepository } from '../../src/repository/challengeRepository.interface.js';
import { Challenge } from '../../src/domain/challenge.js';

describe('GetChallengeByIdUseCase', () => {
  const sampleChallenge: Challenge = {
    id: 'ocean-sharks-multithread',
    title: 'Simulação Shark Tank',
    category: 'Sistemas Concorrentes',
    difficulty: 'Difícil',
    type: 'simulation',
    description: 'Simulação multithread de tubarões'
  };

  const createMockChallengeRepo = (): IChallengeRepository => ({
    findAll: vi.fn(),
    findById: vi.fn()
  });

  // Cenário de sucesso
  it('deve retornar o desafio correto quando o ID existir no repositório', () => {
    const repo = createMockChallengeRepo();
    vi.mocked(repo.findById).mockReturnValue(sampleChallenge);

    const useCase = new GetChallengeByIdUseCase(repo);
    const result = useCase.execute('ocean-sharks-multithread');

    expect(result).toEqual(sampleChallenge);
    expect(repo.findById).toHaveBeenCalledWith('ocean-sharks-multithread');
  });

  // Validações e regras de negócio
  it('deve retornar null imediatamente sem chamar o repositório quando o ID for vazio', () => {
    const repo = createMockChallengeRepo();
    const useCase = new GetChallengeByIdUseCase(repo);

    const result = useCase.execute('');

    expect(result).toBeNull();
    expect(repo.findById).not.toHaveBeenCalled();
  });

  it('deve retornar null sem chamar o repositório quando o ID for inválido (não string)', () => {
    const repo = createMockChallengeRepo();
    const useCase = new GetChallengeByIdUseCase(repo);

    const result = useCase.execute(null as unknown as string);

    expect(result).toBeNull();
    expect(repo.findById).not.toHaveBeenCalled();
  });

  // Cenário de erro / item não encontrado
  it('deve retornar null quando o ID não for encontrado no repositório', () => {
    const repo = createMockChallengeRepo();
    vi.mocked(repo.findById).mockReturnValue(null);

    const useCase = new GetChallengeByIdUseCase(repo);
    const result = useCase.execute('desafio-inexistente');

    expect(result).toBeNull();
    expect(repo.findById).toHaveBeenCalledWith('desafio-inexistente');
  });

  it('deve propagar erro quando o repositório lançar uma exceção', () => {
    const repo = createMockChallengeRepo();
    vi.mocked(repo.findById).mockImplementation(() => {
      throw new Error('Storage reading error');
    });

    const useCase = new GetChallengeByIdUseCase(repo);

    expect(() => useCase.execute('ocean-sharks-multithread')).toThrow('Storage reading error');
  });
});
