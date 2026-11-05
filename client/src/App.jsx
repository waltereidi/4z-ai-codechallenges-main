import React, { useState, useEffect, useCallback } from 'react';
import { Waves, TreePine, Zap, Map, Database, RotateCcw, Award, Flame, Heart, Wind } from 'lucide-react';
import OceanCanvas from './components/OceanCanvas';
import CenterTelemetryColumn from './components/CenterTelemetryColumn';
import PassiveTreeTab from './components/PassiveTreeTab';
import SkillsLoadoutTab from './components/SkillsLoadoutTab';
import MapDeviceTab from './components/MapDeviceTab';
import { calculateMapTelemetry } from './data/gameCatalog';
import './App.css';

async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(`/api${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (res.ok) return await res.json();
    const errJson = await res.json().catch(() => ({}));
    return { success: false, error: errJson.error || `HTTP ${res.status}` };
  } catch (_) {
    try {
      const fallbackRes = await fetch(`http://localhost:5000/api${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
      return await fallbackRes.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('passivas'); // 'passivas' | 'skills' | 'mapa'
  const [profile, setProfile] = useState({
    id: 'alpha_shark',
    nivel: 1,
    maxNivel: 30,
    maxTreeNodes: 300,
    xpAtual: 0,
    xpProximoNivel: 100,
    biomassa: 0,
    pontosPassivaDisponiveis: 1,
    pontosPassivaAlocados: 0,
    nosPassivas: [],
    habilidadesEquipadas: ['snap_strike', 'tail_sweep']
  });

  const [passiveBonuses, setPassiveBonuses] = useState({
    tagMultipliers: {
      Mordida: 1.0,
      Ataque: 1.0,
      Físico: 1.0,
      Sangramento: 1.0,
      Projétil: 1.0,
      Área: 1.0,
      Movimento: 1.0,
      Defesa: 1.0,
      Grito: 1.0,
      Buff: 1.0
    },
    suctionRadius: 42,
    maxFrenzyCharges: 3
  });

  const [treeData, setTreeData] = useState(null);
  const [selectedTier, setSelectedTier] = useState(1);
  const [selectedAffixes, setSelectedAffixes] = useState([]);
  const [mapTelemetry, setMapTelemetry] = useState(() => calculateMapTelemetry(1, []));
  const [expeditionState, setExpeditionState] = useState('em_andamento'); // 'pronto' | 'em_andamento' | 'pausado' | 'derrota'
  const [deathReport, setDeathReport] = useState(null);
  const [recentExpeditions, setRecentExpeditions] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  const [controlMapping, setControlMapping] = useState({
    preset: 'default',
    slot1: 'Q / Clique E',
    slot2: 'W / Clique D / Espaço'
  });

  const [liveTelemetry, setLiveTelemetry] = useState({
    hp: 180,
    maxHp: 180,
    folego: 100,
    maxFolego: 100,
    frenzyCharges: 0,
    maxFrenzyCharges: 3,
    activeEntitiesCount: 14,
    killsCount: 0,
    preyDevouredCount: 0,
    killsPerMinute: 0,
    elapsedSeconds: 0,
    runXpGained: 0,
    runBiomassGained: 0,
    buffs: {}
  });

  const [combatLog, setCombatLog] = useState([]);

  const applyServerPayload = useCallback((data) => {
    if (!data || !data.success) return;
    if (data.profile) setProfile(data.profile);
    if (data.passiveBonuses) setPassiveBonuses(data.passiveBonuses);
    if (data.catalogs?.passiveTree) setTreeData(data.catalogs.passiveTree);
    if (data.recentExpeditions) setRecentExpeditions(data.recentExpeditions);
    if (data.mapConfig) {
      setSelectedTier(data.mapConfig.tier || 1);
      setSelectedAffixes(data.mapConfig.afixos || []);
      if (data.mapConfig.telemetry) {
        setMapTelemetry(data.mapConfig.telemetry);
      }
    }
  }, []);

  // Carrega perfil inicial do backend SQLite WAL (GET /api/game/profile)
  useEffect(() => {
    apiRequest('/game/profile').then((data) => {
      if (data && data.success) {
        applyServerPayload(data);
      }
    });
  }, [applyServerPayload]);

  // Atalho de teclado [Tab] para alternar instantaneamente entre as 3 Abas Laterais sem pausar o oceano
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Tab' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        setActiveTab((prev) => {
          if (prev === 'passivas') return 'skills';
          if (prev === 'skills') return 'mapa';
          return 'passivas';
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleCombatLogEvent = useCallback((ev) => {
    setCombatLog((prev) => [ev, ...prev.slice(0, 24)]);
  }, []);

  // Alocação de nós na Árvore de 300 Passivas (POST /api/game/passives/allocate)
  const handleAllocateNodes = useCallback(async (nodeIds) => {
    const data = await apiRequest('/game/passives/allocate', {
      method: 'POST',
      body: JSON.stringify({ nodeIds })
    });
    if (data && data.success) {
      applyServerPayload(data);
      setStatusMessage(`✔ Árvore atualizada (${nodeIds.length}/30 nós alocados).`);
    } else if (data?.error) {
      setStatusMessage(`⚠️ ${data.error}`);
    }
  }, [applyServerPayload]);

  // Reembolso de passivas
  const handleResetPassives = useCallback(async () => {
    const data = await apiRequest('/game/profile/reset', {
      method: 'POST',
      body: JSON.stringify({ mode: 'passives' })
    });
    if (data && data.success) {
      applyServerPayload(data);
      setStatusMessage('✔ Pontos de passiva reembolsados para reconfiguração.');
    }
  }, [applyServerPayload]);

  // Equipar 2 habilidades ativas (POST /api/game/skills/equip)
  const handleEquipSkills = useCallback(async (skillsArray) => {
    const data = await apiRequest('/game/skills/equip', {
      method: 'POST',
      body: JSON.stringify({ skills: skillsArray })
    });
    if (data && data.success) {
      applyServerPayload(data);
    }
  }, [applyServerPayload]);

  // Recalcular Dificuldade Exponencial no Map Device (POST /api/game/map/calculate)
  const recalculateMapOnServer = useCallback(async (nextTier, nextAffixes) => {
    const localTele = calculateMapTelemetry(
      nextTier,
      nextAffixes,
      passiveBonuses?.xpMultiplierPct || 0,
      passiveBonuses?.biomassMultiplierPct || 0
    );
    setMapTelemetry(localTele);

    const data = await apiRequest('/game/map/calculate', {
      method: 'POST',
      body: JSON.stringify({ tier: nextTier, affixes: nextAffixes, persist: true })
    });
    if (data?.success && data.telemetry) {
      setMapTelemetry(data.telemetry);
    }
  }, [passiveBonuses]);

  const handleChangeTier = useCallback((tierNum) => {
    setSelectedTier(tierNum);
    recalculateMapOnServer(tierNum, selectedAffixes);
  }, [selectedAffixes, recalculateMapOnServer]);

  const handleToggleAffix = useCallback((affixId) => {
    const nextAffixes = selectedAffixes.includes(affixId)
      ? selectedAffixes.filter(a => a !== affixId)
      : [...selectedAffixes, affixId];
    setSelectedAffixes(nextAffixes);
    recalculateMapOnServer(selectedTier, nextAffixes);
  }, [selectedAffixes, selectedTier, recalculateMapOnServer]);

  const handleApplyPreset = useCallback((tierNum, affixesList) => {
    setSelectedTier(tierNum);
    setSelectedAffixes(affixesList);
    recalculateMapOnServer(tierNum, affixesList);
  }, [recalculateMapOnServer]);

  // Confirmar e Mergulhar (POST /api/game/expedition/start)
  const handleStartExpedition = useCallback(async () => {
    setDeathReport(null);
    const data = await apiRequest('/game/expedition/start', {
      method: 'POST',
      body: JSON.stringify({ tier: selectedTier, affixes: selectedAffixes })
    });
    if (data && data.success) {
      applyServerPayload(data);
    }
    setExpeditionState('em_andamento');
    handleCombatLogEvent({
      type: 'system',
      text: `Expedição iniciada em Tier ${selectedTier} (D=${mapTelemetry.difficulty}, Pack=${mapTelemetry.maxEntities})`
    });
  }, [selectedTier, selectedAffixes, mapTelemetry, applyServerPayload, handleCombatLogEvent]);

  // Ciclo de Derrota e Congelamento Total (POST /api/game/expedition/finish)
  const handleExpeditionDeath = useCallback(async (report) => {
    setExpeditionState('derrota');
    setDeathReport(report);
    handleCombatLogEvent({
      type: 'death',
      text: `💀 DERROTA em T${report.tier}: ${report.causaMorte}`
    });

    if (report.unsyncedXp > 0 || report.unsyncedBiomass > 0) {
      await apiRequest('/game/profile/progress', {
        method: 'POST',
        body: JSON.stringify({ xpDelta: report.unsyncedXp, biomassDelta: report.unsyncedBiomass })
      });
    }

    const data = await apiRequest('/game/expedition/finish', {
      method: 'POST',
      body: JSON.stringify({
        tier: report.tier,
        dificuldade: report.dificuldade,
        inimigosAbatidos: report.inimigosAbatidos,
        tempoSobrevivenciaSegundos: report.tempoSobrevivenciaSegundos,
        xpTotalGanho: report.xpTotalGanho,
        biomassaGanha: report.biomassaGanha,
        causaMorte: report.causaMorte,
        alreadySyncedXp: true
      })
    });
    if (data && data.success) {
      applyServerPayload(data);
    }
  }, [applyServerPayload, handleCombatLogEvent]);

  // Sincronização contínua de XP e Biomassa para subir de nível (até o Cap 30) ao vivo
  const handleLiveProgressGain = useCallback(async (xpDelta, biomassDelta) => {
    const data = await apiRequest('/game/profile/progress', {
      method: 'POST',
      body: JSON.stringify({ xpDelta, biomassDelta })
    });
    if (data && data.success) {
      applyServerPayload(data);
    }
  }, [applyServerPayload]);

  const handleTogglePause = useCallback(() => {
    setExpeditionState((prev) => (prev === 'pausado' ? 'em_andamento' : 'pausado'));
  }, []);

  const xpRatioPct = profile.xpProximoNivel > 0
    ? Math.min(100, Math.round((profile.xpAtual / profile.xpProximoNivel) * 100))
    : 100;

  return (
    <div className="abyssal-app-shell">
      {/* =====================================================================
          TOPBAR: Nível do Tubarão (Cap 30 / 10% da Árvore) | Barra de XP | Biomassa | HP | Fôlego | Frenesi
          ===================================================================== */}
      <header className="abyssal-topbar">
        <div className="topbar-brand">
          <img src="/logo-4zoom-branco.png" alt="4zOOm" className="topbar-logo" />
          <div className="brand-titles">
            <h1>SHARK TANK: ABYSSAL EXILE</h1>
            <span className="brand-subtitle">Cookie Clicker Incremental × Path of Exile ARPG</span>
          </div>
        </div>

        <div className="topbar-telemetry-strip">
          {/* Nível do Tubarão (Cap 30 / 10% da Árvore de 300 Nós) */}
          <div className="top-stat-pill level-pill">
            <Award size={15} color="#facc15" />
            <div>
              <span className="top-pill-label">NÍVEL (REGRA 1:10)</span>
              <strong>
                Nv. {profile.nivel} / 30 <small>({profile.pontosPassivaAlocados}/300 nós)</small>
              </strong>
            </div>
            {profile.pontosPassivaDisponiveis > 0 && (
              <button
                type="button"
                className="unspent-points-badge"
                onClick={() => setActiveTab('passivas')}
                title="Clique para alocar pontos de passiva disponíveis"
              >
                +{profile.pontosPassivaDisponiveis} pt{profile.pontosPassivaDisponiveis > 1 ? 's' : ''}
              </button>
            )}
          </div>

          {/* Barra de XP */}
          <div className="top-stat-pill xp-pill">
            <div className="xp-pill-header">
              <span>XP ({xpRatioPct}%)</span>
              <strong>{profile.xpAtual} / {profile.xpProximoNivel}</strong>
            </div>
            <div className="top-xp-bar">
              <div className="top-xp-fill" style={{ width: `${xpRatioPct}%` }} />
            </div>
          </div>

          {/* Biomassa */}
          <div className="top-stat-pill biomass-pill">
            <Database size={14} color="#b03af0" />
            <div>
              <span className="top-pill-label">BIOMASSA</span>
              <strong style={{ color: '#e879f9' }}>{profile.biomassa.toLocaleString('pt-BR')}</strong>
            </div>
          </div>

          {/* HP Atual / Máx */}
          <div className="top-stat-pill hp-pill">
            <Heart size={14} color="#10b981" />
            <div>
              <span className="top-pill-label">HP ATUAL / MÁX</span>
              <strong style={{ color: '#34d399' }}>{liveTelemetry.hp} / {liveTelemetry.maxHp}</strong>
            </div>
          </div>

          {/* Fôlego */}
          <div className="top-stat-pill folego-pill">
            <Wind size={14} color="#00e5ff" />
            <div>
              <span className="top-pill-label">FÔLEGO</span>
              <strong style={{ color: '#38bdf8' }}>{liveTelemetry.folego} / {liveTelemetry.maxFolego}</strong>
            </div>
          </div>

          {/* Frenesi (●●○) */}
          <div className="top-stat-pill frenzy-pill">
            <Flame size={14} color="#f43f5e" />
            <div>
              <span className="top-pill-label">FRENESI</span>
              <strong className="top-frenzy-dots">
                {Array.from({ length: liveTelemetry.maxFrenzyCharges || 3 }).map((_, idx) => (
                  <span key={idx} className={idx < liveTelemetry.frenzyCharges ? 'on' : 'off'}>
                    {idx < liveTelemetry.frenzyCharges ? '●' : '○'}
                  </span>
                ))}
              </strong>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================================
          LAYOUT TRIPARTIDO ESTILO COOKIE CLICKER (42% | 20% | 38%)
          Visualização 100% Contínua: O oceano nunca é ocultado durante os menus
          ===================================================================== */}
      <main className="abyssal-tripartite-grid">
        {/* COLUNA ESQUERDA (42%): Oceano ao Vivo & Combate em Tempo Real */}
        <section className="tri-col col-left-ocean">
          <OceanCanvas
            profile={profile}
            passiveBonuses={passiveBonuses}
            mapTelemetry={mapTelemetry}
            expeditionState={expeditionState}
            deathReport={deathReport}
            controlMapping={controlMapping}
            onStartExpedition={handleStartExpedition}
            onTogglePause={handleTogglePause}
            onExpeditionDeath={handleExpeditionDeath}
            onLiveTelemetryUpdate={setLiveTelemetry}
            onLiveProgressGain={handleLiveProgressGain}
            onCombatLogEvent={handleCombatLogEvent}
            onSelectTab={setActiveTab}
          />
        </section>

        {/* COLUNA CENTRAL (20%): Telemetria e Combate Rápido */}
        <section className="tri-col col-center-telemetry">
          <CenterTelemetryColumn
            profile={profile}
            liveTelemetry={liveTelemetry}
            mapTelemetry={mapTelemetry}
            passiveBonuses={passiveBonuses}
            combatLog={combatLog}
            recentExpeditions={recentExpeditions}
          />
        </section>

        {/* COLUNA DIREITA (38%): Painel de Gestão - 3 Abas Permanentes */}
        <section className="tri-col col-right-management">
          <div className="persistent-tabs-bar">
            <button
              type="button"
              className={`persistent-tab-btn ${activeTab === 'passivas' ? 'active' : ''}`}
              onClick={() => setActiveTab('passivas')}
            >
              <span>🌳 Passivas</span>
              <small className="tab-badge">{profile.pontosPassivaAlocados}/30</small>
            </button>

            <button
              type="button"
              className={`persistent-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              <span>⚡ Skills</span>
              <small className="tab-badge">2 Slots</small>
            </button>

            <button
              type="button"
              className={`persistent-tab-btn ${activeTab === 'mapa' ? 'active' : ''}`}
              onClick={() => setActiveTab('mapa')}
            >
              <span>🗺️ Dificuldade</span>
              <small className="tab-badge">T{selectedTier}</small>
            </button>
          </div>

          <div className="persistent-tab-body">
            {activeTab === 'passivas' && (
              <PassiveTreeTab
                treeData={treeData}
                profile={profile}
                passiveBonuses={passiveBonuses}
                onAllocateNodes={handleAllocateNodes}
                onResetPassives={handleResetPassives}
                statusMessage={statusMessage}
              />
            )}

            {activeTab === 'skills' && (
              <SkillsLoadoutTab
                profile={profile}
                passiveBonuses={passiveBonuses}
                controlMapping={controlMapping}
                onUpdateControlMapping={setControlMapping}
                onEquipSkills={handleEquipSkills}
              />
            )}

            {activeTab === 'mapa' && (
              <MapDeviceTab
                selectedTier={selectedTier}
                selectedAffixes={selectedAffixes}
                mapTelemetry={mapTelemetry}
                expeditionState={expeditionState}
                onChangeTier={handleChangeTier}
                onToggleAffix={handleToggleAffix}
                onApplyPreset={handleApplyPreset}
                onConfirmAndDive={handleStartExpedition}
              />
            )}
          </div>
        </section>
      </main>

      {/* =====================================================================
          FOOTER OFICIAL (Seção 2.1)
          ===================================================================== */}
      <footer className="abyssal-footer">
        <div>
          <strong>Frontend:</strong> React (Vite) @ <code>localhost:5173</code> | <strong>SQLite WAL Backend</strong>
        </div>
        <div>
          <strong>Atalhos Rápidos:</strong> <code>[Q, W, Cliques E/D, Espaço, Tab]</code> • Regra 1:10 (300 Nós / Cap Nível 30)
        </div>
      </footer>
    </div>
  );
}
