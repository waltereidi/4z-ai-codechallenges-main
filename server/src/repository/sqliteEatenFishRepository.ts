import Database from 'better-sqlite3';
import { EatenFish } from '../domain/eatenFish.js';
import { SharkCount } from '../domain/tankStats.js';
import { IEatenFishRepository } from './eatenFishRepository.interface.js';

export class SqliteEatenFishRepository implements IEatenFishRepository {
  constructor(private readonly db: Database.Database) {}

  record(eatenFish: EatenFish): void {
    const stmt = this.db.prepare(`
      INSERT INTO peixes_comidos (
        peixe_id, conteudo_peixe, tamanho_peixe, tubarao_id, tubarao_nome,
        hora_comeu, peixe_criado_em, x_captura, y_captura
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      eatenFish.peixe_id,
      eatenFish.conteudo_peixe,
      eatenFish.tamanho_peixe,
      eatenFish.tubarao_id,
      eatenFish.tubarao_nome,
      eatenFish.hora_comeu,
      eatenFish.peixe_criado_em,
      eatenFish.x_captura,
      eatenFish.y_captura
    );
  }

  countByShark(sharkId: number): number {
    const row = this.db.prepare('SELECT COUNT(*) as total FROM peixes_comidos WHERE tubarao_id = ?').get(sharkId) as { total: number } | undefined;
    return row?.total ?? 0;
  }

  countAll(): number {
    const row = this.db.prepare('SELECT COUNT(*) as total FROM peixes_comidos').get() as { total: number } | undefined;
    return row?.total ?? 0;
  }

  getSharkCounts(): SharkCount[] {
    const rows = this.db.prepare(`
      SELECT tubarao_id, tubarao_nome, COUNT(*) as count 
      FROM peixes_comidos 
      GROUP BY tubarao_id
    `).all() as SharkCount[];
    return rows;
  }

  getRecentHistory(limit = 10): EatenFish[] {
    const rows = this.db.prepare(`
      SELECT * FROM peixes_comidos ORDER BY id DESC LIMIT ?
    `).all(limit) as EatenFish[];
    return rows;
  }

  deleteAll(): void {
    this.db.prepare('DELETE FROM peixes_comidos').run();
  }
}
