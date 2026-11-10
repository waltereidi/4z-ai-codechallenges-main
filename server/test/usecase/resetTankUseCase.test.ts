import { describe, it, expect, vi } from 'vitest';
import { ResetTankUseCase } from '../../src/usecase/resetTankUseCase.js';
import { IFishRepository } from '../../src/repository/fishRepository.interface.js';
import { IEatenFishRepository } from '../../src/repository/eatenFishRepository.interface.js';

describe('ResetTankUseCase', () => {
  const createMockFishRepository = (): IFishRepository => ({
    create: vi.fn(),
    findById: vi.fn(),
    markAsEaten: vi.fn(),
    countAll: vi.fn(),
    deleteAll: vi.fn()
  });

  const createMockEatenFishRepository = (): IEatenFishRepository => ({
    record: vi.fn(),
    countAll: vi.fn(),
    countByShark: vi.fn(),
    getSharkCounts: vi.fn(),
    getRecentHistory: vi.fn(),
    deleteAll: vi.fn()
  });

  // Cenário de sucesso
  it('deve limpar as duas tabelas e retornar sucesso', () => {
    const fishRepo = createMockFishRepository();
    const eatenFishRepo = createMockEatenFishRepository();

    const useCase = new ResetTankUseCase(fishRepo, eatenFishRepo);
    const result = useCase.execute();

    expect(result).toEqual({ success: true });
    expect(fishRepo.deleteAll).toHaveBeenCalledTimes(1);
    expect(eatenFishRepo.deleteAll).toHaveBeenCalledTimes(1);
  });

  // Cenários de erro
  it('deve propagar erro se a limpeza de peixes falhar', () => {
    const fishRepo = createMockFishRepository();
    const eatenFishRepo = createMockEatenFishRepository();

    vi.mocked(fishRepo.deleteAll).mockImplementation(() => {
      throw new Error('Failed to delete fishes');
    });

    const useCase = new ResetTankUseCase(fishRepo, eatenFishRepo);

    expect(() => useCase.execute()).toThrow('Failed to delete fishes');
    expect(eatenFishRepo.deleteAll).not.toHaveBeenCalled();
  });

  it('deve propagar erro se a limpeza de peixes comidos falhar', () => {
    const fishRepo = createMockFishRepository();
    const eatenFishRepo = createMockEatenFishRepository();

    vi.mocked(eatenFishRepo.deleteAll).mockImplementation(() => {
      throw new Error('Failed to delete eaten fishes');
    });

    const useCase = new ResetTankUseCase(fishRepo, eatenFishRepo);

    expect(() => useCase.execute()).toThrow('Failed to delete eaten fishes');
    expect(fishRepo.deleteAll).toHaveBeenCalledTimes(1);
  });

  // Teste com Fake repositories
  it('deve esvaziar os repositórios fakes em memória', () => {
    let fishCount = 10;
    let eatenCount = 5;

    const fakeFishRepo: IFishRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      markAsEaten: vi.fn(),
      countAll: () => fishCount,
      deleteAll: () => { fishCount = 0; }
    };

    const fakeEatenRepo: IEatenFishRepository = {
      record: vi.fn(),
      countAll: () => eatenCount,
      countByShark: vi.fn(),
      getSharkCounts: vi.fn(),
      getRecentHistory: vi.fn(),
      deleteAll: () => { eatenCount = 0; }
    };

    const useCase = new ResetTankUseCase(fakeFishRepo, fakeEatenRepo);
    const res = useCase.execute();

    expect(res.success).toBe(true);
    expect(fakeFishRepo.countAll()).toBe(0);
    expect(fakeEatenRepo.countAll()).toBe(0);
  });
});
