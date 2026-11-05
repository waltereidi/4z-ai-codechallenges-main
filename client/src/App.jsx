import React, { useState, useEffect, useCallback } from 'react';
import { Database, Award, Flame, Heart, Wind } from 'lucide-react';
import OceanCanvas from './components/OceanCanvas';
import PassiveTreeTab from './components/PassiveTreeTab';
import SkillsLoadoutTab from './components/SkillsLoadoutTab';
import MapDeviceTab from './components/MapDeviceTab';
import { calculateMapTelemetry, getDifficultyColorInfo } from './data/gameCatalog';
import './App.css';

function createPageSessionInfo() {
  const navEntry = typeof performance !== 'undefined' && performance.getEntriesByType
    ? performance.getEntriesByType('navigation')?.[0]
    : null;
  const navType = navEntry?.type || 'navigate';
  let previousSessionId = null;
  try {
    previousSessionId = sessionStorage.getItem('sharktank_session_id');
  } catch (_) {
    previousSessionId = null;
  }

  const sessionId = `st_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  const loadedAt = new Date().toISOString();

  try {
    sessionStorage.setItem('sharktank_session_id', sessionId);
    sessionStorage.setItem('sharktank_previous_session_id', previousSessionId || 'none');
    sessionStorage.setItem('sharktank_loaded_at', loadedAt);
  } catch (_) {
    // Ignore storage errors in restricted environments
  }

  const info = {
    sessionId,
    previousSessionId: previousSessionId || null,
    navigationType: navType,
    isReload: navType === 'reload' || Boolean(previousSessionId),
    loadedAt,
    screenFullyLoaded: false
  };

  if (typeof window !== 'undefined') {
    window.__SHARKTANK_SESSION__ = info;
  }

  return info;
}

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
  const [sessionInfo, setSessionInfo] = useState(() => createPageSessionInfo());
  const [screenFullyLoaded, setScreenFullyLoaded] = useState(false);

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

  // Reinicia o estado do jogo toda vez que o browser reinicia/recarrega e detecta quando a tela carregou 100%
  useEffect(() => {
    let isMounted = true;

    const waitForWindowComplete = () =>
      new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', () => resolve(), { once: true });
        }
      });

    const initializeFreshBrowserSession = async () => {
      const [resetData] = await Promise.all([
        apiRequest('/game/profile/reset', {
          method: 'POST',
          body: JSON.stringify({
            mode: 'full',
            sessionId: sessionInfo.sessionId,
            navigationType: sessionInfo.navigationType
          })
        }),
        waitForWindowComplete()
      ]);

      if (!isMounted) return;

      if (resetData && resetData.success) {
        applyServerPayload(resetData);
      } else {
        const fallbackData = await apiRequest('/game/profile');
        if (isMounted && fallbackData && fallbackData.success) {
          applyServerPayload(fallbackData);
        }
      }

      setDeathReport(null);
      setExpeditionState('em_andamento');
      setScreenFullyLoaded(true);

      const updatedSession = {
        ...sessionInfo,
        screenFullyLoaded: true,
        fullyLoadedAt: new Date().toISOString()
      };
      setSessionInfo(updatedSession);

      if (typeof window !== 'undefined') {
        window.__SHARKTANK_SESSION__ = updatedSession;
        window.dispatchEvent(
          new CustomEvent('sharktank:screen-fully-loaded', { detail: updatedSession })
        );
      }
    };

    initializeFreshBrowserSession();

    return () => {
      isMounted = false;
    };
  }, [applyServerPayload, sessionInfo.sessionId, sessionInfo.navigationType]);

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

  // Alocação de nós na Árvore de Passivas
  const handleAllocateNodes = useCallback(async (nodeIds) => {
    const data = await apiRequest('/game/passives/allocate', {
      method: 'POST',
      body: JSON.stringify({ nodeIds })
    });
    if (data && data.success) {
      applyServerPayload(data);
      setStatusMessage('✔ Árvore de passivas atualizada com sucesso!');
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

  // Equipar 2 habilidades ativas
  const handleEquipSkills = useCallback(async (skillsArray) => {
    const data = await apiRequest('/game/skills/equip', {
      method: 'POST',
      body: JSON.stringify({ skills: skillsArray })
    });
    if (data && data.success) {
      applyServerPayload(data);
    }
  }, [applyServerPayload]);

  // Recalcular Dificuldade no Map Device
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

  // Confirmar e Mergulhar
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
      text: `Expedição iniciada em Zona ${selectedTier}`
    });
  }, [selectedTier, selectedAffixes, applyServerPayload, handleCombatLogEvent]);

  // Ciclo de Derrota e Congelamento Total
  const handleExpeditionDeath = useCallback(async (report) => {
    setExpeditionState('derrota');
    setDeathReport(report);
    handleCombatLogEvent({
      type: 'death',
      text: `💀 Fim do mergulho: ${report.causaMorte}`
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

  // Sincronização contínua de XP e Biomassa
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

  const currentDiffColor = getDifficultyColorInfo(mapTelemetry?.difficulty, selectedTier);

  return (
    <div
      className="abyssal-app-shell"
      data-session-id={sessionInfo.sessionId}
      data-navigation-type={sessionInfo.navigationType}
      data-screen-loaded={screenFullyLoaded ? 'true' : 'false'}
    >
      {/* =====================================================================
          TOPBAR: SharkTank (Sem Subtítulo) | Status da Sessão | Indicadores do Tubarão
          ===================================================================== */}
      <header className="abyssal-topbar">
        <div className="topbar-brand">
          <img src="/logo-4zoom-branco.png" alt="4zOOm" className="topbar-logo" />
          <div className="brand-titles">
            <h1>SharkTank</h1>
          </div>
          <span
            className={`session-status-pill ${screenFullyLoaded ? 'ready' : 'loading'}`}
            title={`Sessão Atual: ${sessionInfo.sessionId} (${sessionInfo.navigationType})`}
          >
            <span className="session-dot" />
            {screenFullyLoaded ? `Sessão: ${sessionInfo.sessionId}` : 'Carregando Tela...'}
          </span>
        </div>

        <div className="topbar-telemetry-strip">
          {/* Nível do Tubarão */}
          <div className="top-stat-pill level-pill">
            <Award size={16} color="#eab308" />
            <div>
              <span className="top-pill-label">NÍVEL DO TUBARÃO</span>
              <strong>Nv. {profile.nivel}</strong>
            </div>
            {profile.pontosPassivaDisponiveis > 0 && (
              <button
                type="button"
                className="unspent-points-badge"
                onClick={() => setActiveTab('passivas')}
                title="Clique para usar seus pontos de passiva disponíveis"
              >
                +{profile.pontosPassivaDisponiveis} pt{profile.pontosPassivaDisponiveis > 1 ? 's' : ''}
              </button>
            )}
          </div>

          {/* Barra de XP */}
          <div className="top-stat-pill xp-pill">
            <div className="xp-pill-header">
              <span>EXPERIÊNCIA</span>
              <strong>{profile.xpAtual} / {profile.xpProximoNivel}</strong>
            </div>
            <div className="top-xp-bar">
              <div className="top-xp-fill" style={{ width: `${xpRatioPct}%` }} />
            </div>
          </div>

          {/* Biomassa */}
          <div className="top-stat-pill biomass-pill">
            <Database size={15} color="#9333ea" />
            <div>
              <span className="top-pill-label">BIOMASSA</span>
              <strong style={{ color: '#7e22ce' }}>{profile.biomassa.toLocaleString('pt-BR')}</strong>
            </div>
          </div>

          {/* HP Atual / Máx */}
          <div className="top-stat-pill hp-pill">
            <Heart size={15} color="#e11d48" />
            <div>
              <span className="top-pill-label">VIDA (HP)</span>
              <strong style={{ color: '#be123c' }}>{liveTelemetry.hp} / {liveTelemetry.maxHp}</strong>
            </div>
          </div>

          {/* Fôlego */}
          <div className="top-stat-pill folego-pill">
            <Wind size={15} color="#0284c7" />
            <div>
              <span className="top-pill-label">FÔLEGO</span>
              <strong style={{ color: '#0369a1' }}>{liveTelemetry.folego} / {liveTelemetry.maxFolego}</strong>
            </div>
          </div>

          {/* Frenesi (●●○) */}
          <div className="top-stat-pill frenzy-pill">
            <Flame size={15} color="#f97316" />
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
          LAYOUT BIPARTIDO (56% | 44%) — SEM RODAPÉ E SEM COLUNA DE TELEMETRIA
          ===================================================================== */}
      <main className="abyssal-tripartite-grid">
        {/* COLUNA ESQUERDA (56%): Oceano ao Vivo & Combate em Tempo Real */}
        <section className="tri-col col-left-ocean">
          <OceanCanvas
            sessionId={sessionInfo.sessionId}
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

        {/* COLUNA DIREITA (44%): Painel de Gestão - 3 Abas Permanentes */}
        <section className="tri-col col-right-management">
          <div className="persistent-tabs-bar">
            <button
              type="button"
              className={`persistent-tab-btn ${activeTab === 'passivas' ? 'active' : ''}`}
              onClick={() => setActiveTab('passivas')}
            >
              <span>🌳 Passivas</span>
              <small className="tab-badge">{profile.pontosPassivaAlocados} pts</small>
            </button>

            <button
              type="button"
              className={`persistent-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              <span>⚡ Habilidades</span>
              <small className="tab-badge">[Q] e [W]</small>
            </button>

            <button
              type="button"
              className={`persistent-tab-btn ${activeTab === 'mapa' ? 'active' : ''}`}
              onClick={() => setActiveTab('mapa')}
            >
              <span>🎨 Dificuldade</span>
              <small
                className="tab-badge difficulty-color-dot-badge"
                style={{
                  backgroundColor: currentDiffColor.bgLight,
                  color: currentDiffColor.textColor,
                  border: `1.5px solid ${currentDiffColor.color}`
                }}
              >
                <span className="color-dot-inline" style={{ backgroundColor: currentDiffColor.color }} />
                {currentDiffColor.shortName}
              </small>
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
    </div>
  );
}
