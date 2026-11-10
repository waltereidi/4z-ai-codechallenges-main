import { describe, it, expect, vi } from 'vitest';
import { EatFishUseCase } from '../../src/usecase/eatFishUseCase.js';
import { IFishRepository } from '../../src/repository/fishRepository.interface.js';
import { IEatenFishRepository } from '../../src/repository/eatenFishRepository.interface.js';
import { EatFishDTO } from '../../src/domain/eatenFish.js';
import { Fish } from '../../src/domain/fish.js';

describe('EatFishUseCase', () => {
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

  const existingFish: Fish = {
    id: 'fish-target-1',
    conteudo: 'plancton saboroso',
    tamanho: 24,
    x: 45,
    y: 50,
    cor: '#10b981',
    criado_em: '2026-11-09T10:00:00.000Z',
    status: 'ativo'
  };

  // Cenário de sucesso
  it('deve registrar peixe comido, atualizar status e retornar estatística do tubarão', () => {
    const fishRepo = createMockFishRepository();
    const eatenFishRepo = createMockEatenFishRepository();

    vi.mocked(fishRepo.findById).mockReturnValue(existingFish);
    vi.mocked(eatenFishRepo.countByShark).mockReturnValue(3);

    const useCase = new EatFishUseCase(fishRepo, eatenFishRepo);

    const dto: EatFishDTO = {
      peixe_id: 'fish-target-1',
      tubarao_id: 2,
      tubarao_nome: 'Tubarão Martelo',
      x_captura: 45.2,
      y_captura: 50.1
    };

    const result = useCase.execute(dto);

    expect(result.success).toBe(true);
    expect(result.tubarao_id).toBe(2);
    expect(result.peixes_comidos_total).toBe(3);
    expect(typeof result.hora_comeu).toBe('string');

    // Interações com repositórios
    expect(fishRepo.findById).toHaveBeenCalledWith('fish-target-1');
    expect(eatenFishRepo.record).toHaveBeenCalledWith(
      expect.objectContaining({
        peixe_id: 'fish-target-1',
        conteudo_peixe: 'plancton saboroso',
        tamanho_peixe: 24,
        tubarao_id: 2,
        tubarao_nome: 'Tubarão Martelo',
        peixe_criado_em: '2026-11-09T10:00:00.000Z',
        x_captura: 45.2,
        y_captura: 50.1
      })
    );
    expect(fishRepo.markAsEaten).toHaveBeenCalledWith('fish-target-1');
    expect(eatenFishRepo.countByShark).toHaveBeenCalledWith(2);
  });

  // Validações e regras de negócio
  it('deve retornar { success: false } e não registrar nada quando o peixe não for encontrado', () => {
    const fishRepo = createMockFishRepository();
    const eatenFishRepo = createMockEatenFishRepository();

    vi.mocked(fishRepo.findById).mockReturnValue(null);

    const useCase = new EatFishUseCase(fishRepo, eatenFishRepo);

    const dto: EatFishDTO = {
      peixe_id: 'non-existing-fish',
      tubarao_id: 1,
      tubarao_nome: 'Tubarão Branco',
      x_captura: 10,
      y_captura: 10
    };

    const result = useCase.execute(dto);

    expect(result).toEqual({ success: false });
    expect(fishRepo.findById).toHaveBeenCalledWith('non-existing-fish');
    expect(eatenFishRepo.record).not.toHaveBeenCalled();
    expect(fishRepo.markAsEaten).not.toHaveBeenCalled();
    expect(eatenFishRepo.countByShark).not.toHaveBeenCalled();
  });

  // Cenários de erro
  it('deve propagar erro quando findById do repositório falhar', () => {
    const fishRepo = createMockFishRepository();
    const eatenFishRepo = createMockEatenFishRepository();

    vi.mocked(fishRepo.findById).mockImplementation(() => {
      throw new Error('Database read failure');
    });

    const useCase = new EatFishUseCase(fishRepo, eatenFishRepo);

    expect(() =>
      useCase.execute({
        peixe_id: 'f-1',
        tubarao_id: 1,
        tubarao_nome: 'Tubarão',
        x_captura: 0,
        y_captura: 0
      })
    ).toThrow('Database read failure');

    expect(eatenFishRepo.record).not.toHaveBeenCalled();
  });

  it('deve propagar erro quando record do repositório de comidos falhar', () => {
    const fishRepo = createMockFishRepository();
    const eatenFishRepo = createMockEatenFishRepository();

    vi.mocked(fishRepo.findById).mockReturnValue(existingFish);
    vi.mocked(eatenFishRepo.record).mockImplementation(() => {
      throw new Error('Insert record failure');
    });

    const useCase = new EatFishUseCase(fishRepo, eatenFishRepo);

    expect(() =>
      useCase.execute({
        peixe_id: 'fish-target-1',
        tubarao_id: 1,
        tubarao_nome: 'Tubarão Branco',
        x_captura: 10,
        y_captura: 10
      })
    ).toThrow('Insert record failure');
  });

  // Teste com Fake Repositories
  it('deve funcionar corretamente usando fake repositories em memória', () => {
    const fishes: Fish[] = [{ ...existingFish }];
    const eatenRecords: unknown[] = [];

    const fakeFishRepo: IFishRepository = {
      create: vi.fn(),
      findById: (id: string) => fishes.find(f => f.id === id) || null,
      markAsEaten: (id: string) => {
        const f = fishes.find(item => item.id === id);
        if (f) f.status = 'comido';
      },
      countAll: () => fishes.length,
      deleteAll: () => { fishes.length = 0; }
    };

    const fakeEatenRepo: IEatenFishRepository = {
      record: (r) => { eatenRecords.push(r); },
      countAll: () => eatenRecords.length,
      countByShark: (sId) => eatenRecords.filter((r: any) => r.tubarao_id === sId).length,
      getSharkCounts: () => [],
      getRecentHistory: () => [],
      deleteAll: () => { eatenRecords.length = 0; }
    };

    const useCase = new EatFishUseCase(fakeFishRepo, fakeEatenRepo);
    const res = useCase.execute({
      peixe_id: 'fish-target-1',
      tubarao_id: 3,
      tubarao_nome: 'Tubarão Tigre',
      x_captura: 45,
      y_captura: 50
    });

    expect(res.success).toBe(true);
    expect(res.tubarao_id).toBe(3);
    expect(res.peixes_comidos_total).toBe(1);
    expect(fishes[0].status).toBe('comido');
    expect(eatenRecords).toHaveLength(1);
  });
});
