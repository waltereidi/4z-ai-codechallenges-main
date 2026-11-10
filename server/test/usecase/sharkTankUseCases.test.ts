import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initDatabase } from '../../src/infrastructure/database.js';
import { SqliteFishRepository } from '../../src/repository/sqliteFishRepository.js';
import { SqliteEatenFishRepository } from '../../src/repository/sqliteEatenFishRepository.js';
import { CreateFishUseCase } from '../../src/usecase/createFishUseCase.js';
import { EatFishUseCase } from '../../src/usecase/eatFishUseCase.js';
import { GetTankStatsUseCase } from '../../src/usecase/getTankStatsUseCase.js';
import { ResetTankUseCase } from '../../src/usecase/resetTankUseCase.js';

describe('Shark Tank Use Cases (with SQLite Repository)', () => {
  let db: Database.Database;
  let fishRepo: SqliteFishRepository;
  let eatenFishRepo: SqliteEatenFishRepository;

  beforeEach(() => {
    // In-memory database for testing
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE IF NOT EXISTS peixes (
        id TEXT PRIMARY KEY,
        conteudo TEXT NOT NULL,
        tamanho INTEGER NOT NULL,
        x REAL NOT NULL,
        y REAL NOT NULL,
        cor TEXT NOT NULL,
        criado_em TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ativo'
      );
      CREATE TABLE IF NOT EXISTS peixes_comidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        peixe_id TEXT NOT NULL,
        conteudo_peixe TEXT NOT NULL,
        tamanho_peixe INTEGER NOT NULL,
        tubarao_id INTEGER NOT NULL,
        tubarao_nome TEXT NOT NULL,
        hora_comeu TEXT NOT NULL,
        peixe_criado_em TEXT NOT NULL,
        x_captura REAL NOT NULL,
        y_captura REAL NOT NULL
      );
    `);

    fishRepo = new SqliteFishRepository(db);
    eatenFishRepo = new SqliteEatenFishRepository(db);
  });

  it('CreateFishUseCase should insert a fish and increment count', () => {
    const createUseCase = new CreateFishUseCase(fishRepo);

    const result = createUseCase.execute({
      id: 'fish_abc',
      conteudo: 'alga',
      tamanho: 22,
      x: 15.5,
      y: 35.0,
      cor: '#f97316'
    });

    expect(result.success).toBe(true);
    expect(fishRepo.countAll()).toBe(1);

    const saved = fishRepo.findById('fish_abc');
    expect(saved).not.toBeNull();
    expect(saved?.conteudo).toBe('alga');
    expect(saved?.status).toBe('ativo');
  });

  it('EatFishUseCase should successfully record eaten fish and mark fish status as comido', () => {
    const createUseCase = new CreateFishUseCase(fishRepo);
    createUseCase.execute({
      id: 'fish_to_eat',
      conteudo: 'camarão',
      tamanho: 18,
      x: 20,
      y: 40,
      cor: '#ec4899'
    });

    const eatUseCase = new EatFishUseCase(fishRepo, eatenFishRepo);
    const result = eatUseCase.execute({
      peixe_id: 'fish_to_eat',
      tubarao_id: 1,
      tubarao_nome: 'Tubarão Branco',
      x_captura: 20,
      y_captura: 40
    });

    expect(result.success).toBe(true);
    expect(result.tubarao_id).toBe(1);
    expect(result.peixes_comidos_total).toBe(1);
    expect(result.hora_comeu).toBeDefined();

    const fishAfter = fishRepo.findById('fish_to_eat');
    expect(fishAfter?.status).toBe('comido');
    expect(eatenFishRepo.countAll()).toBe(1);
  });

  it('EatFishUseCase should return { success: false } when fish ID does not exist', () => {
    const eatUseCase = new EatFishUseCase(fishRepo, eatenFishRepo);
    const result = eatUseCase.execute({
      peixe_id: 'non_existent_fish',
      tubarao_id: 2,
      tubarao_nome: 'Tubarão Martelo',
      x_captura: 10,
      y_captura: 10
    });

    expect(result.success).toBe(false);
    expect(eatenFishRepo.countAll()).toBe(0);
  });

  it('GetTankStatsUseCase should aggregate counts and history correctly', () => {
    const createUseCase = new CreateFishUseCase(fishRepo);
    createUseCase.execute({ id: 'f1', conteudo: 'c1', tamanho: 10, x: 1, y: 1 });
    createUseCase.execute({ id: 'f2', conteudo: 'c2', tamanho: 12, x: 2, y: 2 });

    const eatUseCase = new EatFishUseCase(fishRepo, eatenFishRepo);
    eatUseCase.execute({
      peixe_id: 'f1',
      tubarao_id: 1,
      tubarao_nome: 'Tubarão Branco',
      x_captura: 1,
      y_captura: 1
    });

    const statsUseCase = new GetTankStatsUseCase(fishRepo, eatenFishRepo);
    const stats = statsUseCase.execute();

    expect(stats.totalPeixesCriados).toBe(2);
    expect(stats.totalPeixesComidos).toBe(1);
    expect(stats.sharksCounts).toHaveLength(1);
    expect(stats.sharksCounts[0].tubarao_id).toBe(1);
    expect(stats.sharksCounts[0].count).toBe(1);
    expect(stats.historicoRecente).toHaveLength(1);
  });

  it('ResetTankUseCase should delete all fishes and eaten records', () => {
    const createUseCase = new CreateFishUseCase(fishRepo);
    createUseCase.execute({ id: 'f1', conteudo: 'c1', tamanho: 10, x: 1, y: 1 });

    const eatUseCase = new EatFishUseCase(fishRepo, eatenFishRepo);
    eatUseCase.execute({
      peixe_id: 'f1',
      tubarao_id: 3,
      tubarao_nome: 'Tubarão Tigre',
      x_captura: 1,
      y_captura: 1
    });

    expect(fishRepo.countAll()).toBe(1);
    expect(eatenFishRepo.countAll()).toBe(1);

    const resetUseCase = new ResetTankUseCase(fishRepo, eatenFishRepo);
    const result = resetUseCase.execute();

    expect(result.success).toBe(true);
    expect(fishRepo.countAll()).toBe(0);
    expect(eatenFishRepo.countAll()).toBe(0);
  });
});
