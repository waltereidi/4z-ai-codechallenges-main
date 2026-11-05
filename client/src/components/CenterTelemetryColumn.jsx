import React from 'react';
import { Activity, Heart, Wind, Flame, Skull, Crosshair, History, Shield, Zap } from 'lucide-react';
import { BESTIARY_CATALOG } from '../data/gameCatalog';

export default function CenterTelemetryColumn({
  profile,
  liveTelemetry,
  mapTelemetry,
  passiveBonuses,
  combatLog,
  recentExpeditions
}) {
  const hp = liveTelemetry?.hp ?? 180;
  const maxHp = liveTelemetry?.maxHp ?? 180;
  const folego = liveTelemetry?.folego ?? 100;
  const maxFolego = liveTelemetry?.maxFolego ?? 100;
  const frenzy = liveTelemetry?.frenzyCharges ?? 0;
  const maxFrenzy = liveTelemetry?.maxFrenzyCharges ?? 3;

  const hpPct = Math.max(0, Math.min(100, Math.round((hp / maxHp) * 100)));
  const folegoPct = Math.max(0, Math.min(100, Math.round((folego / maxFolego) * 100)));

  const buffs = liveTelemetry?.buffs || {};

  return (
    <div className="center-telemetry-column">
      <div className="telemetry-section-header">
        <Activity size={15} color="#00e5ff" />
        <span>TELEMETRIA & COMBATE RÁPIDO</span>
      </div>

      {/* Barras Dinâmicas de Vida, Fôlego e Cargas de Frenesi */}
      <div className="telemetry-bars-card">
        <div className="tele-bar-group">
          <div className="tele-bar-label">
            <span><Heart size={12} color="#10b981" /> HP do Tubarão</span>
            <strong>{hp} / {maxHp} ({hpPct}%)</strong>
          </div>
          <div className="tele-progress-track">
            <div className="tele-progress-fill hp-fill" style={{ width: `${hpPct}%` }} />
          </div>
        </div>

        <div className="tele-bar-group">
          <div className="tele-bar-label">
            <span><Wind size={12} color="#00e5ff" /> Fôlego / Oxigênio</span>
            <strong>{folego} / {maxFolego} ({folegoPct}%)</strong>
          </div>
          <div className="tele-progress-track">
            <div className="tele-progress-fill folego-fill" style={{ width: `${folegoPct}%` }} />
          </div>
        </div>

        <div className="frenzy-charges-row">
          <span><Flame size={12} color="#f43f5e" /> Cargas de Frenesi:</span>
          <div className="frenzy-dots">
            {Array.from({ length: maxFrenzy }).map((_, i) => (
              <span
                key={i}
                className={`frenzy-orb ${i < frenzy ? 'active' : ''}`}
                title={`Carga de Frenesi ${i + 1}`}
              >
                {i < frenzy ? '●' : '○'}
              </span>
            ))}
          </div>
        </div>

        {/* Status / Auras em Tempo Real */}
        <div className="active-status-pills">
          {buffs.megalodonFrenzy > 0 && (
            <span className="status-pill buff">🩸 Megalodonte ({buffs.megalodonFrenzy}s)</span>
          )}
          {buffs.iframe > 0 && (
            <span className="status-pill iframe">🛡️ I-Frame ({buffs.iframe}s)</span>
          )}
          {buffs.stunned > 0 && (
            <span className="status-pill debuff-stun">⚡ Atordoado ({buffs.stunned}s)</span>
          )}
          {buffs.bleeding > 0 && (
            <span className="status-pill debuff-bleed">🩸 Sangrando ({buffs.bleeding}s)</span>
          )}
          {buffs.poisoned > 0 && (
            <span className="status-pill debuff-poison">☠️ Veneno ({buffs.poisoned}s)</span>
          )}
          {buffs.cryoSlowed && (
            <span className="status-pill debuff-cryo">❄️ Aura Criogênica (-35%)</span>
          )}
        </div>
      </div>

      {/* Indicadores Exponenciais em Tempo Real (Seção 2.1) */}
      <div className="telemetry-kpi-grid">
        <div className="tele-kpi-item">
          <span className="kpi-label">Dificuldade D(T,A)</span>
          <strong className="kpi-value" style={{ color: '#fa6400' }}>
            {mapTelemetry?.difficulty || 10.0}
          </strong>
          <small>{mapTelemetry?.hazardLabel}</small>
        </div>

        <div className="tele-kpi-item">
          <span className="kpi-label">Mult. de XP Atual</span>
          <strong className="kpi-value" style={{ color: '#34d399' }}>
            {mapTelemetry?.xpMultiplier || 1.0}x
          </strong>
          <small>+{liveTelemetry?.runXpGained || 0} XP no run</small>
        </div>

        <div className="tele-kpi-item">
          <span className="kpi-label">Densidade (Pack)</span>
          <strong className="kpi-value" style={{ color: '#00e5ff' }}>
            {liveTelemetry?.activeEntitiesCount || 0} / {mapTelemetry?.maxEntities || 14}
          </strong>
          <small>Teto máx: 34</small>
        </div>

        <div className="tele-kpi-item">
          <span className="kpi-label">Taxa de Abates</span>
          <strong className="kpi-value" style={{ color: '#f43f5e' }}>
            {liveTelemetry?.killsPerMinute || 0}/min
          </strong>
          <small>{liveTelemetry?.killsCount || 0} abatidos ({liveTelemetry?.elapsedSeconds || 0}s)</small>
        </div>

        <div className="tele-kpi-item">
          <span className="kpi-label">Biomassa no Run</span>
          <strong className="kpi-value" style={{ color: '#b03af0' }}>
            +{liveTelemetry?.runBiomassGained || 0}
          </strong>
          <small>Mult: {mapTelemetry?.biomassMultiplier || 1.0}x</small>
        </div>

        <div className="tele-kpi-item">
          <span className="kpi-label">Presas Devoradas</span>
          <strong className="kpi-value" style={{ color: '#38bdf8' }}>
            {liveTelemetry?.preyDevouredCount || 0} 🐟
          </strong>
          <small>+10% HP / +15 Fôlego</small>
        </div>
      </div>

      {/* Resumo de Atributos Defensivos e QoL da Build */}
      <div className="build-mini-stats">
        <div className="mini-stat-row">
          <span>Armadura / Redução Física:</span>
          <strong>{Math.round((passiveBonuses?.armorPct || 0) * 100)}%</strong>
        </div>
        <div className="mini-stat-row">
          <span>Resistência Cáustica/Elétrica:</span>
          <strong>{Math.round((passiveBonuses?.hazardResistance || 0) * 100)}%</strong>
        </div>
        <div className="mini-stat-row">
          <span>Raio Sucção Eletrossensorial:</span>
          <strong>{passiveBonuses?.suctionRadius || 42}px</strong>
        </div>
        <div className="mini-stat-row">
          <span>Mordida Instintiva (Autoclick):</span>
          <strong style={{ color: passiveBonuses?.instinctiveBite ? '#34d399' : '#64748b' }}>
            {passiveBonuses?.instinctiveBite ? 'ATIVA' : 'Inativa'}
          </strong>
        </div>
      </div>

      {/* Log de Eventos de Combate em Tempo Real */}
      <div className="combat-log-box">
        <div className="log-box-header">
          <Zap size={13} color="#fa6400" />
          <span>LOG DE EVENTOS DE COMBATE</span>
        </div>
        <div className="combat-log-list">
          {combatLog.length === 0 ? (
            <div className="log-empty">Clique no oceano ou pressione [Q, W] para caçar presas e abater inimigos...</div>
          ) : (
            combatLog.map((ev, i) => (
              <div key={i} className={`combat-log-entry ${ev.type}`}>
                <span className="log-bullet">›</span>
                <span>{ev.text}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bestiário Rápido & Histórico Recente do SQLite WAL */}
      <div className="recent-runs-box">
        <div className="log-box-header">
          <History size={13} color="#b03af0" />
          <span>HISTÓRICO SQLITE ({recentExpeditions?.length || 0})</span>
        </div>
        <div className="recent-runs-list">
          {(!recentExpeditions || recentExpeditions.length === 0) ? (
            <div className="log-empty">Nenhuma morte registrada ainda.</div>
          ) : (
            recentExpeditions.slice(0, 4).map((run) => (
              <div key={run.id} className="recent-run-pill">
                <div className="run-pill-top">
                  <strong>T{run.tier} (D={run.dificuldade})</strong>
                  <span>{run.inimigos_abatidos} kills • {run.tempo_sobrevivencia_segundos}s</span>
                </div>
                <div className="run-pill-cause">{run.causa_morte}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
