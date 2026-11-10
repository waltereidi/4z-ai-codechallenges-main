import { describe, it, expect, vi } from 'vitest';
import { GetTankStatsUseCase } from '../../src/usecase/getTankStatsUseCase.js';
import { IFishRepository } from '../../src/repository/fishRepository.interface.js';
import { IEatenFishRepository } from '../../src/repository/eatenFishRepository.interface.js';
import { EatenFishRecord } from '../../src/domain/eatenFish.js';

describe('GetTankStatsUseCase', () => {
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

  const mockHistory: EatenFishRecord[] = [
    {
      id: 1,
      peixe_id: 'p1',
      conteudo_peixe: 'alga',
      tamanho_peixe: 15,
      tubarao_id: 1,
      tubarao_nome: 'Tubarão Branco',
      hora_comeu: '2026-11-09T14:00:00.000Z',
      peixe_criado_em: '2026-11-09T13:50:00.000Z',
      x_captura: 10,
      y_captura: 20
    }
  ];

  // Cenário de sucesso
  it('deve consolidar e retornar todas as métricas do tanque corretamente', () => {
    const fishRepo = createMockFishRepository();
    const eatenFishRepo = createMockEatenFishRepository();

    vi.mocked(fishRepo.countAll).mockReturnValue(12);
    vi.mocked(eatenFishRepo.countAll).mockReturnValue(5);
    vi.mocked(eatenFishRepo.getSharkCounts).mockReturnValue([
      { tubarao_id: 1, count: 3 },
      { tubarao_id: 2, count: 2 }
    ]);
    vi.mocked(eatenFishRepo.getRecentHistory).mockReturnValue(mockHistory);

    const useCase = new GetTankStatsUseCase(fishRepo, eatenFishRepo);
    const stats = useCase.execute();

    expect(stats).toEqual({
      totalPeixesCriados: 12,
      totalPeixesComidos: 5,
      sharksCounts: [
        { tubarao_id: 1, count: 3 },
        { tubarao_id: 2, count: 2 }
      ],
      historicoRecente: mockHistory
    });

    // Interações com os repositórios
    expect(fishRepo.countAll).toHaveBeenCalledTimes(1);
    expect(eatenFishRepo.countAll).toHaveBeenCalledTimes(1);
    expect(eatenFishRepo.getSharkCounts).toHaveBeenCalledTimes(1);
    expect(eatenFishRepo.getRecentHistory).toHaveBeenCalledWith(10);
  });

  // Regra de negócio: limite de 10 no histórico e tanque vazio
  it('deve solicitar exatamente os 10 últimos registros do histórico recente', () => {
    const fishRepo = createMockFishRepository();
    const eatenFishRepo = createMockEatenFishRepository();

    vi.mocked(fishRepo.countAll).mockReturnValue(0);
    vi.mocked(eatenFishRepo.countAll).mockReturnValue(0);
    vi.mocked(eatenFishRepo.getSharkCounts).mockReturnValue([]);
    vi.mocked(eatenFishRepo.getRecentHistory).mockReturnValue([]);

    const useCase = new GetTankStatsUseCase(fishRepo, eatenFishRepo);
    const stats = useCase.execute();

    expect(stats.totalPeixesCriados).toBe(0);
    expect(stats.totalPeixesComidos).toBe(0);
    expect(stats.sharksCounts).toEqual([]);
    expect(stats.historicoRecente).toEqual([]);
    expect(eatenFishRepo.getRecentHistory).toHaveBeenCalledWith(10);
  });

  // Cenário de erro
  it('deve propagar erro quando fishRepository falhar ao contar peixes', () => {
    const fishRepo = createMockFishRepository();
    const eatenFishRepo = createMockEatenFishRepository();

    vi.mocked(fishRepo.countAll).mockImplementation(() => {
      throw new Error('Database count query failure');
    });

    const useCase = new GetTankStatsUseCase(fishRepo, eatenFishRepo);

    expect(() => useCase.execute()).toThrow('Database count query failure');
  });

  it('deve propagar erro quando eatenFishRepository falhar', () => {
    const fishRepo = createMockFishRepository();
    const eatenFishRepo = createMockEatenFishRepository();

    vi.mocked(fishRepo.countAll).mockReturnValue(5);
    vi.mocked(eatenFishRepo.countAll).mockImplementation(() => {
      throw new Error('Eaten repo failure');
    });

    const useCase = new GetTankStatsUseCase(fishRepo, eatenFishRepo);

    expect(() => useCase.execute()).toThrow('Eaten repo failure');
  });
});
