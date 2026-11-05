const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'shark_tank.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Modo WAL (Write-Ahead Logging) para alta concorrência e performance
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// ============================================================================
// Esquema Oficial de Banco de Dados — Shark Tank: Abyssal Exile (Seção 8.1)
// ============================================================================

db.exec(`
  -- Perfil persistente do jogador e build (Regra 1:10 -> Nível Máximo 30 para 300 nós)
  CREATE TABLE IF NOT EXISTS jogador_build (
    id TEXT PRIMARY KEY,
    nivel INTEGER NOT NULL DEFAULT 1 CHECK (nivel >= 1 AND nivel <= 30),
    xp_atual REAL NOT NULL DEFAULT 0,
    xp_proximo_nivel REAL NOT NULL DEFAULT 100,
    biomassa REAL NOT NULL DEFAULT 0,
    pontos_passiva_disponiveis INTEGER NOT NULL DEFAULT 1,
    nos_passivas_json TEXT NOT NULL DEFAULT '[]',
    habilidades_equipadas_json TEXT NOT NULL DEFAULT '["snap_strike", "tail_sweep"]',
    criado_em TEXT NOT NULL,
    atualizado_em TEXT NOT NULL
  );

  -- Estado do Mapa ativo configurado no Map Device
  CREATE TABLE IF NOT EXISTS mapa_config (
    id TEXT PRIMARY KEY,
    tier INTEGER NOT NULL DEFAULT 1,
    dificuldade_calculada REAL NOT NULL,
    densidade_peixes_max INTEGER NOT NULL DEFAULT 14,
    afixos_json TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'pronto'
  );

  -- Histórico de expedições (Telemetria & Analytics)
  CREATE TABLE IF NOT EXISTS historico_expedicoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tier INTEGER NOT NULL,
    dificuldade REAL NOT NULL,
    inimigos_abatidos INTEGER NOT NULL,
    tempo_sobrevivencia_segundos REAL NOT NULL,
    xp_total_ganho REAL NOT NULL,
    causa_morte TEXT,
    data_hora TEXT NOT NULL
  );

  -- Tabelas legadas mantidas para compatibilidade
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

// Seed inicial do perfil do Tubarão Alfa e do Map Device se não existirem
const nowIso = new Date().toISOString();

const existingProfile = db.prepare('SELECT * FROM jogador_build WHERE id = ?').get('alpha_shark');
if (!existingProfile) {
  db.prepare(`
    INSERT INTO jogador_build (
      id, nivel, xp_atual, xp_proximo_nivel, biomassa,
      pontos_passiva_disponiveis, nos_passivas_json, habilidades_equipadas_json,
      criado_em, atualizado_em
    ) VALUES (?, 1, 0, 100, 0, 1, '[]', '["snap_strike", "tail_sweep"]', ?, ?)
  `).run('alpha_shark', nowIso, nowIso);
}

const existingMap = db.prepare('SELECT * FROM mapa_config WHERE id = ?').get('active_map');
if (!existingMap) {
  db.prepare(`
    INSERT INTO mapa_config (
      id, tier, dificuldade_calculada, densidade_peixes_max, afixos_json, status
    ) VALUES (?, 1, 10.0, 14, '[]', 'pronto')
  `).run('active_map');
}

module.exports = { db, dbPath };
