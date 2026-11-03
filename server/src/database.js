const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'shark_tank.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

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
`);

db.exec(`
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

module.exports = { db };
