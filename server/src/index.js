const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { challenges } = require('./challengesData');
const { db, dbPath } = require('./database');
const {
  MAX_TREE_VARIATIONS,
  MAX_SHARK_LEVEL,
  SKILLS_CATALOG,
  BESTIARY_CATALOG,
  RARE_AFFIXES_CATALOG,
  MAP_AFFIXES_CATALOG,
  MAP_TIERS_CATALOG,
  PASSIVE_TREE_DATA,
  calculateMapTelemetry,
  validatePassiveAllocation,
  computePassiveBonuses,
  getXpForNextLevel
} = require('./gameData');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper para montar o payload completo do perfil do jogador
function getFullProfilePayload() {
  let profileRow = db.prepare('SELECT * FROM jogador_build WHERE id = ?').get('alpha_shark');
  if (!profileRow) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO jogador_build (
        id, nivel, xp_atual, xp_proximo_nivel, biomassa,
        pontos_passiva_disponiveis, nos_passivas_json, habilidades_equipadas_json,
        criado_em, atualizado_em
      ) VALUES ('alpha_shark', 1, 0, 100, 0, 1, '[]', '["snap_strike", "tail_sweep"]', ?, ?)
    `).run(now, now);
    profileRow = db.prepare('SELECT * FROM jogador_build WHERE id = ?').get('alpha_shark');
  }

  let mapRow = db.prepare('SELECT * FROM mapa_config WHERE id = ?').get('active_map');
  if (!mapRow) {
    db.prepare(`
      INSERT INTO mapa_config (id, tier, dificuldade_calculada, densidade_peixes_max, afixos_json, status)
      VALUES ('active_map', 1, 10.0, 14, '[]', 'pronto')
    `).run();
    mapRow = db.prepare('SELECT * FROM mapa_config WHERE id = ?').get('active_map');
  }

  let allocatedNodes = [];
  try {
    allocatedNodes = JSON.parse(profileRow.nos_passivas_json || '[]');
  } catch (_) {
    allocatedNodes = [];
  }

  let equippedSkills = ['snap_strike', 'tail_sweep'];
  try {
    const parsed = JSON.parse(profileRow.habilidades_equipadas_json || '["snap_strike", "tail_sweep"]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      equippedSkills = parsed.slice(0, 2);
    }
  } catch (_) {
    equippedSkills = ['snap_strike', 'tail_sweep'];
  }

  let mapAffixes = [];
  try {
    mapAffixes = JSON.parse(mapRow.afixos_json || '[]');
  } catch (_) {
    mapAffixes = [];
  }

  // Regra 1:10 -> No nível L (1..30), o jogador tem direito a L pontos totais de passiva
  const nivel = Math.min(MAX_SHARK_LEVEL, Math.max(1, profileRow.nivel));
  const totalPointsBudget = nivel;
  const pointsAvailable = Math.max(0, totalPointsBudget - allocatedNodes.length);

  if (pointsAvailable !== profileRow.pontos_passiva_disponiveis) {
    db.prepare('UPDATE jogador_build SET pontos_passiva_disponiveis = ? WHERE id = ?')
      .run(pointsAvailable, 'alpha_shark');
  }

  const passiveBonuses = computePassiveBonuses(allocatedNodes);
  const mapTelemetry = calculateMapTelemetry(
    mapRow.tier,
    mapAffixes,
    passiveBonuses.xpMultiplierPct,
    passiveBonuses.biomassMultiplierPct
  );

  const recentExpeditions = db
    .prepare('SELECT * FROM historico_expedicoes ORDER BY id DESC LIMIT 12')
    .all();

  return {
    profile: {
      id: profileRow.id,
      nivel,
      maxNivel: MAX_SHARK_LEVEL,
      maxTreeNodes: MAX_TREE_VARIATIONS,
      xpAtual: Number(profileRow.xp_atual.toFixed(1)),
      xpProximoNivel: profileRow.xp_proximo_nivel,
      biomassa: Number(profileRow.biomassa.toFixed(1)),
      pontosPassivaDisponiveis: pointsAvailable,
      pontosPassivaAlocados: allocatedNodes.length,
      nosPassivas: allocatedNodes,
      habilidadesEquipadas: equippedSkills,
      criadoEm: profileRow.criado_em,
      atualizadoEm: profileRow.atualizado_em
    },
    passiveBonuses,
    mapConfig: {
      id: mapRow.id,
      tier: mapRow.tier,
      dificuldadeCalculada: mapTelemetry.difficulty,
      densidadePeixesMax: mapTelemetry.maxEntities,
      afixos: mapAffixes,
      status: mapRow.status,
      telemetry: mapTelemetry
    },
    recentExpeditions,
    catalogs: {
      skills: SKILLS_CATALOG,
      bestiary: BESTIARY_CATALOG,
      rareAffixes: RARE_AFFIXES_CATALOG,
      mapAffixes: MAP_AFFIXES_CATALOG,
      mapTiers: MAP_TIERS_CATALOG,
      passiveTree: PASSIVE_TREE_DATA
    }
  };
}

// Helper para aplicar ganho de XP e Biomassa respeitando o Cap de Nível 30 (Regra 1:10)
function applyProgression(xpDelta = 0, biomassDelta = 0) {
  const row = db.prepare('SELECT * FROM jogador_build WHERE id = ?').get('alpha_shark');
  if (!row) return;

  let nivel = Math.min(MAX_SHARK_LEVEL, Math.max(1, row.nivel));
  let xpAtual = Math.max(0, row.xp_atual + (Number(xpDelta) || 0));
  let xpProximo = getXpForNextLevel(nivel);
  const biomassa = Math.max(0, row.biomassa + (Number(biomassDelta) || 0));

  while (nivel < MAX_SHARK_LEVEL && xpProximo > 0 && xpAtual >= xpProximo) {
    xpAtual -= xpProximo;
    nivel += 1;
    xpProximo = getXpForNextLevel(nivel);
  }

  if (nivel >= MAX_SHARK_LEVEL) {
    nivel = MAX_SHARK_LEVEL;
    xpProximo = getXpForNextLevel(MAX_SHARK_LEVEL - 1);
    xpAtual = Math.min(xpAtual, xpProximo);
  }

  let allocatedNodes = [];
  try {
    allocatedNodes = JSON.parse(row.nos_passivas_json || '[]');
  } catch (_) {
    allocatedNodes = [];
  }

  const pontosDisponiveis = Math.max(0, nivel - allocatedNodes.length);

  db.prepare(`
    UPDATE jogador_build
    SET nivel = ?,
        xp_atual = ?,
        xp_proximo_nivel = ?,
        biomassa = ?,
        pontos_passiva_disponiveis = ?,
        atualizado_em = ?
    WHERE id = 'alpha_shark'
  `).run(nivel, xpAtual, xpProximo, biomassa, pontosDisponiveis, new Date().toISOString());
}

// ============================================================================
// Rotas Oficiais da API REST — Shark Tank: Abyssal Exile (Seção 8.2)
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Shark Tank: Abyssal Exile API',
    dbPath,
    walMode: db.pragma('journal_mode', { simple: true })
  });
});

// 1. GET /api/game/profile
// Carrega nível, XP, biomassa, passivas alocadas e as 2 habilidades habilitadas.
app.get('/api/game/profile', (req, res) => {
  try {
    const payload = getFullProfilePayload();
    res.json({ success: true, ...payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. POST /api/game/skills/equip
// Atualiza a lista e atalhos das 2 habilidades ativas habilitadas.
app.post('/api/game/skills/equip', (req, res) => {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills) || skills.length === 0 || skills.length > 2) {
      return res.status(400).json({
        success: false,
        error: 'Restrição Severa: Exatamente até 2 habilidades podem estar habilitadas simultaneamente (Slot 1 e Slot 2).'
      });
    }

    const validIds = new Set(SKILLS_CATALOG.map(s => s.id));
    for (const skillId of skills) {
      if (!validIds.has(skillId)) {
        return res.status(400).json({
          success: false,
          error: `Habilidade desconhecida no catálogo: ${skillId}`
        });
      }
    }

    if (skills.length === 2 && skills[0] === skills[1]) {
      return res.status(400).json({
        success: false,
        error: 'Selecione 2 habilidades distintas para o Slot 1 e Slot 2.'
      });
    }

    db.prepare(`
      UPDATE jogador_build
      SET habilidades_equipadas_json = ?, atualizado_em = ?
      WHERE id = 'alpha_shark'
    `).run(JSON.stringify(skills), new Date().toISOString());

    const payload = getFullProfilePayload();
    res.json({ success: true, ...payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/game/passives/allocate
// Valida dependências no grafo e salva a alocação de novos nós de passiva (Regra 1:10 -> máx 30 de 300).
app.post('/api/game/passives/allocate', (req, res) => {
  try {
    const { nodeIds } = req.body;
    const profileRow = db.prepare('SELECT * FROM jogador_build WHERE id = ?').get('alpha_shark');
    const playerLevel = profileRow ? profileRow.nivel : 1;

    const validation = validatePassiveAllocation(nodeIds, playerLevel);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    const normalizedIds = validation.normalizedIds;
    const pointsAvailable = Math.max(0, playerLevel - normalizedIds.length);

    db.prepare(`
      UPDATE jogador_build
      SET nos_passivas_json = ?,
          pontos_passiva_disponiveis = ?,
          atualizado_em = ?
      WHERE id = 'alpha_shark'
    `).run(JSON.stringify(normalizedIds), pointsAvailable, new Date().toISOString());

    const payload = getFullProfilePayload();
    res.json({ success: true, ...payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/game/map/calculate
// Calcula no backend a dificuldade exponencial D(T, A), Pack Size N_max e o multiplicador de XP.
app.post('/api/game/map/calculate', (req, res) => {
  try {
    const { tier = 1, affixes = [], persist = true } = req.body;
    const profileRow = db.prepare('SELECT * FROM jogador_build WHERE id = ?').get('alpha_shark');
    let allocatedNodes = [];
    try {
      allocatedNodes = JSON.parse(profileRow?.nos_passivas_json || '[]');
    } catch (_) {
      allocatedNodes = [];
    }

    const bonuses = computePassiveBonuses(allocatedNodes);
    const telemetry = calculateMapTelemetry(
      tier,
      affixes,
      bonuses.xpMultiplierPct,
      bonuses.biomassMultiplierPct
    );

    if (persist) {
      db.prepare(`
        UPDATE mapa_config
        SET tier = ?,
            dificuldade_calculada = ?,
            densidade_peixes_max = ?,
            afixos_json = ?
        WHERE id = 'active_map'
      `).run(
        telemetry.tier,
        telemetry.difficulty,
        telemetry.maxEntities,
        JSON.stringify(telemetry.activeAffixes)
      );
    }

    res.json({
      success: true,
      telemetry
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. POST /api/game/expedition/start
// Inicia a expedição após a confirmação expressa do jogador.
app.post('/api/game/expedition/start', (req, res) => {
  try {
    const { tier, affixes } = req.body || {};
    const mapRow = db.prepare('SELECT * FROM mapa_config WHERE id = ?').get('active_map');
    const profileRow = db.prepare('SELECT * FROM jogador_build WHERE id = ?').get('alpha_shark');

    const finalTier = tier !== undefined ? Number(tier) : (mapRow?.tier || 1);
    let finalAffixes = affixes;
    if (!Array.isArray(finalAffixes)) {
      try {
        finalAffixes = JSON.parse(mapRow?.afixos_json || '[]');
      } catch (_) {
        finalAffixes = [];
      }
    }

    let allocatedNodes = [];
    try {
      allocatedNodes = JSON.parse(profileRow?.nos_passivas_json || '[]');
    } catch (_) {
      allocatedNodes = [];
    }
    const bonuses = computePassiveBonuses(allocatedNodes);
    const telemetry = calculateMapTelemetry(
      finalTier,
      finalAffixes,
      bonuses.xpMultiplierPct,
      bonuses.biomassMultiplierPct
    );

    db.prepare(`
      UPDATE mapa_config
      SET tier = ?,
          dificuldade_calculada = ?,
          densidade_peixes_max = ?,
          afixos_json = ?,
          status = 'em_andamento'
      WHERE id = 'active_map'
    `).run(
      telemetry.tier,
      telemetry.difficulty,
      telemetry.maxEntities,
      JSON.stringify(telemetry.activeAffixes)
    );

    const payload = getFullProfilePayload();
    res.json({
      success: true,
      message: 'Expedição iniciada nas profundezas abissais.',
      ...payload
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. POST /api/game/expedition/finish
// Congela a sessão no servidor ao registrar a morte do tubarão e salva relatório analítico.
app.post('/api/game/expedition/finish', (req, res) => {
  try {
    const {
      tier = 1,
      dificuldade = 10.0,
      inimigosAbatidos = 0,
      tempoSobrevivenciaSegundos = 0,
      xpTotalGanho = 0,
      biomassaGanha = 0,
      causaMorte = 'Colapso sob pressão abissal',
      alreadySyncedXp = false
    } = req.body || {};

    if (!alreadySyncedXp && (xpTotalGanho > 0 || biomassaGanha > 0)) {
      applyProgression(xpTotalGanho, biomassaGanha);
    }

    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO historico_expedicoes (
        tier, dificuldade, inimigos_abatidos, tempo_sobrevivencia_segundos,
        xp_total_ganho, causa_morte, data_hora
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      Number(tier) || 1,
      Number(dificuldade) || 10.0,
      Number(inimigosAbatidos) || 0,
      Number(Number(tempoSobrevivenciaSegundos || 0).toFixed(1)),
      Number(Number(xpTotalGanho || 0).toFixed(1)),
      String(causaMorte || 'Abatido por Inimigos do Mar'),
      now
    );

    db.prepare(`
      UPDATE mapa_config
      SET status = 'derrota'
      WHERE id = 'active_map'
    `).run();

    const payload = getFullProfilePayload();
    res.json({
      success: true,
      message: 'Expedição congelada. Reconfigure passivas, skills e afixos antes de mergulhar novamente.',
      ...payload
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sincronização em tempo real de XP e Biomassa durante o combate (para subir de nível ao vivo)
app.post('/api/game/profile/progress', (req, res) => {
  try {
    const { xpDelta = 0, biomassDelta = 0 } = req.body || {};
    applyProgression(xpDelta, biomassDelta);
    const payload = getFullProfilePayload();
    res.json({ success: true, ...payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset de pontos de passiva ou perfil completo (usado para reiniciar o estado a cada reload do browser)
app.post('/api/game/profile/reset', (req, res) => {
  try {
    const { mode = 'passives', sessionId = null, navigationType = 'navigate' } = req.body || {};
    const now = new Date().toISOString();
    if (mode === 'full') {
      db.prepare(`
        UPDATE jogador_build
        SET nivel = 1,
            xp_atual = 0,
            xp_proximo_nivel = 100,
            biomassa = 0,
            pontos_passiva_disponiveis = 1,
            nos_passivas_json = '[]',
            habilidades_equipadas_json = '["snap_strike", "tail_sweep"]',
            atualizado_em = ?
        WHERE id = 'alpha_shark'
      `).run(now);
      db.prepare(`
        UPDATE mapa_config
        SET tier = 1, dificuldade_calculada = 10.0, densidade_peixes_max = 14, afixos_json = '[]', status = 'em_andamento'
        WHERE id = 'active_map'
      `).run();
      db.prepare('DELETE FROM historico_expedicoes').run();
      db.prepare('DELETE FROM peixes').run();
      db.prepare('DELETE FROM peixes_comidos').run();
    } else {
      const row = db.prepare('SELECT nivel FROM jogador_build WHERE id = ?').get('alpha_shark');
      const nivel = row ? row.nivel : 1;
      db.prepare(`
        UPDATE jogador_build
        SET nos_passivas_json = '[]',
            pontos_passiva_disponiveis = ?,
            atualizado_em = ?
        WHERE id = 'alpha_shark'
      `).run(nivel, now);
    }

    const payload = getFullProfilePayload();
    res.json({
      success: true,
      session: {
        sessionId: sessionId || `st_${Date.now().toString(36)}`,
        navigationType,
        resetConfirmed: mode === 'full',
        resetTimestamp: now
      },
      ...payload
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// Rotas Legadas Mantidas para Compatibilidade
// ============================================================================
app.get('/api/challenges', (req, res) => {
  res.json(challenges);
});

app.get('/api/challenges/:id', (req, res) => {
  const challenge = challenges.find(c => c.id === req.params.id);
  res.json(challenge);
});

app.post('/api/shark-tank/fish', (req, res) => {
  const { id, conteudo, tamanho, x, y, cor, criado_em } = req.body;
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO peixes (id, conteudo, tamanho, x, y, cor, criado_em, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'ativo')
  `);
  stmt.run(id, conteudo || 'presa', tamanho || 20, x || 50, y || 50, cor || '#38bdf8', criado_em || new Date().toISOString());
  res.json({ success: true });
});

app.post('/api/shark-tank/eat', (req, res) => {
  const { peixe_id, tubarao_id, tubarao_nome, x_captura, y_captura } = req.body;
  const peixe = db.prepare('SELECT * FROM peixes WHERE id = ?').get(peixe_id);
  if (!peixe) {
    return res.json({ success: false });
  }

  const hora_comeu = new Date().toISOString();
  db.prepare(`
    INSERT INTO peixes_comidos (
      peixe_id, conteudo_peixe, tamanho_peixe, tubarao_id, tubarao_nome,
      hora_comeu, peixe_criado_em, x_captura, y_captura
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    peixe.id,
    peixe.conteudo,
    peixe.tamanho,
    tubarao_id,
    tubarao_nome,
    hora_comeu,
    peixe.criado_em,
    x_captura,
    y_captura
  );

  db.prepare("UPDATE peixes SET status = 'comido' WHERE id = ?").run(peixe_id);
  const count = db.prepare('SELECT COUNT(*) as total FROM peixes_comidos WHERE tubarao_id = ?').get(tubarao_id);

  res.json({
    success: true,
    tubarao_id,
    peixes_comidos_total: count.total,
    hora_comeu
  });
});

app.get('/api/shark-tank/stats', (req, res) => {
  const totalPeixesCriados = db.prepare('SELECT COUNT(*) as total FROM peixes').get();
  const totalPeixesComidos = db.prepare('SELECT COUNT(*) as total FROM peixes_comidos').get();
  const sharksCounts = db.prepare(`
    SELECT tubarao_id, tubarao_nome, COUNT(*) as count 
    FROM peixes_comidos 
    GROUP BY tubarao_id
  `).all();
  const historicoRecente = db.prepare(`
    SELECT * FROM peixes_comidos ORDER BY id DESC LIMIT 10
  `).all();

  res.json({
    totalPeixesCriados: totalPeixesCriados.total,
    totalPeixesComidos: totalPeixesComidos.total,
    sharksCounts,
    historicoRecente
  });
});

app.post('/api/shark-tank/reset', (req, res) => {
  db.prepare('DELETE FROM peixes').run();
  db.prepare('DELETE FROM peixes_comidos').run();
  res.json({ success: true });
});

// ============================================================================
// Entrega Estática do Frontend React (Vite) em Produção / Docker na Porta 5173
// ============================================================================
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Shark Tank: Abyssal Exile Server running on http://localhost:${PORT} (DB: ${dbPath})`);
});
