import Database from 'better-sqlite3';
import { Fish } from '../domain/fish.js';
import { IFishRepository } from './fishRepository.interface.js';

export class SqliteFishRepository implements IFishRepository {
  constructor(private readonly db: Database.Database) {}

  create(fish: Fish): void {
    const stmt = this.db.prepare(`
      INSERT INTO peixes (id, conteudo, tamanho, x, y, cor, criado_em, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      fish.id,
      fish.conteudo,
      fish.tamanho,
      fish.x,
      fish.y,
      fish.cor,
      fish.criado_em,
      fish.status
    );
  }

  findById(id: string): Fish | null {
    const row = this.db.prepare('SELECT * FROM peixes WHERE id = ?').get(id) as Fish | undefined;
    return row || null;
  }

  markAsEaten(id: string): void {
    this.db.prepare("UPDATE peixes SET status = 'comido' WHERE id = ?").run(id);
  }

  countAll(): number {
    const row = this.db.prepare('SELECT COUNT(*) as total FROM peixes').get() as { total: number };
    return row?.total ?? 0;
  }

  deleteAll(): void {
    this.db.prepare('DELETE FROM peixes').run();
  }
}
