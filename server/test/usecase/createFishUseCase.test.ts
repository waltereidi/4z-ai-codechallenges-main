import { describe, it, expect, vi } from 'vitest';
import { CreateFishUseCase } from '../../src/usecase/createFishUseCase.js';
import { IFishRepository } from '../../src/repository/fishRepository.interface.js';
import { CreateFishDTO, Fish } from '../../src/domain/fish.js';

describe('CreateFishUseCase', () => {
  const createMockFishRepository = (): IFishRepository => ({
    create: vi.fn(),
    findById: vi.fn(),
    markAsEaten: vi.fn(),
    countAll: vi.fn(),
    deleteAll: vi.fn()
  });

  // Cenário de sucesso
  it('deve criar um peixe com sucesso e persistir no repositório', () => {
    const fishRepo = createMockFishRepository();
    const useCase = new CreateFishUseCase(fishRepo);

    const dto: CreateFishDTO = {
      id: 'fish-101',
      conteudo: 'plancton',
      tamanho: 25,
      x: 10,
      y: 20,
      cor: '#f97316',
      criado_em: '2026-11-09T12:00:00.000Z'
    };

    const result = useCase.execute(dto);

    expect(result).toEqual({ success: true });
    expect(fishRepo.create).toHaveBeenCalledTimes(1);
    expect(fishRepo.create).toHaveBeenCalledWith({
      id: 'fish-101',
      conteudo: 'plancton',
      tamanho: 25,
      x: 10,
      y: 20,
      cor: '#f97316',
      criado_em: '2026-11-09T12:00:00.000Z',
      status: 'ativo'
    });
  });

  // Validações e regras de negócio
  it('deve aplicar valores padrão para cor e criado_em quando omitidos', () => {
    const fishRepo = createMockFishRepository();
    const useCase = new CreateFishUseCase(fishRepo);

    const dto: CreateFishDTO = {
      id: 'fish-102',
      conteudo: 'coral',
      tamanho: 15,
      x: 30,
      y: 40
    };

    const result = useCase.execute(dto);

    expect(result.success).toBe(true);
    expect(fishRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'fish-102',
        conteudo: 'coral',
        tamanho: 15,
        x: 30,
        y: 40,
        cor: '#38bdf8',
        status: 'ativo'
      })
    );
  });

  it('deve rejeitar e não chamar o repositório quando o ID for inválido', () => {
    const fishRepo = createMockFishRepository();
    const useCase = new CreateFishUseCase(fishRepo);

    const invalidDto = {
      id: '',
      conteudo: 'teste',
      tamanho: 20,
      x: 10,
      y: 10
    } as CreateFishDTO;

    expect(() => useCase.execute(invalidDto)).toThrow('Fish ID must be a non-empty string');
    expect(fishRepo.create).not.toHaveBeenCalled();
  });

  it('deve rejeitar e não chamar o repositório quando tamanho for menor ou igual a zero', () => {
    const fishRepo = createMockFishRepository();
    const useCase = new CreateFishUseCase(fishRepo);

    const invalidDto: CreateFishDTO = {
      id: 'fish-invalid-size',
      conteudo: 'teste',
      tamanho: 0,
      x: 10,
      y: 10
    };

    expect(() => useCase.execute(invalidDto)).toThrow('Fish size must be a positive number');
    expect(fishRepo.create).not.toHaveBeenCalled();
  });

  it('deve rejeitar e não chamar o repositório quando coordenadas forem inválidas', () => {
    const fishRepo = createMockFishRepository();
    const useCase = new CreateFishUseCase(fishRepo);

    const invalidDto = {
      id: 'fish-invalid-coords',
      conteudo: 'teste',
      tamanho: 15,
      x: null,
      y: 10
    } as unknown as CreateFishDTO;

    expect(() => useCase.execute(invalidDto)).toThrow('Fish coordinates must be valid numbers');
    expect(fishRepo.create).not.toHaveBeenCalled();
  });

  // Cenário de erro
  it('deve propagar erro quando o repositório falhar ao persistir o peixe', () => {
    const fishRepo = createMockFishRepository();
    vi.mocked(fishRepo.create).mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    const useCase = new CreateFishUseCase(fishRepo);

    const dto: CreateFishDTO = {
      id: 'fish-db-fail',
      conteudo: 'alga',
      tamanho: 18,
      x: 5,
      y: 5
    };

    expect(() => useCase.execute(dto)).toThrow('Database connection failed');
    expect(fishRepo.create).toHaveBeenCalledTimes(1);
  });

  // Fake repository implementation test
  it('deve funcionar perfeitamente com implementação fake de repositório', () => {
    const fakeStore: Fish[] = [];
    const fakeRepo: IFishRepository = {
      create: (fish: Fish) => fakeStore.push(fish),
      findById: (id: string) => fakeStore.find(f => f.id === id) || null,
      markAsEaten: (id: string) => {
        const found = fakeStore.find(f => f.id === id);
        if (found) found.status = 'comido';
      },
      countAll: () => fakeStore.length,
      deleteAll: () => {
        fakeStore.length = 0;
      }
    };

    const useCase = new CreateFishUseCase(fakeRepo);
    const result = useCase.execute({
      id: 'fake-fish-1',
      conteudo: 'camarao',
      tamanho: 20,
      x: 12,
      y: 18
    });

    expect(result.success).toBe(true);
    expect(fakeStore).toHaveLength(1);
    expect(fakeStore[0].id).toBe('fake-fish-1');
  });
});
