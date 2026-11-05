import React from 'react';
import { Map, Play, Flame, Users, TrendingUp, AlertTriangle, CheckSquare, Square, Sparkles } from 'lucide-react';
import { MAP_TIERS_CATALOG, MAP_AFFIXES_CATALOG, REFERENCE_SCALING_PRESETS } from '../data/gameCatalog';

export default function MapDeviceTab({
  selectedTier,
  selectedAffixes,
  mapTelemetry,
  expeditionState,
  onChangeTier,
  onToggleAffix,
  onApplyPreset,
  onConfirmAndDive
}) {
  const currentTierObj = MAP_TIERS_CATALOG.find(t => t.tier === selectedTier) || MAP_TIERS_CATALOG[0];

  return (
    <div className="map-device-tab">
      {/* Painel de Telemetria Preditiva (Seção 5.3 e 6) */}
      <div className="predictive-telemetry-card">
        <div className="pred-header">
          <div className="pred-title">
            <Map size={16} color="#00e5ff" />
            <span>MAP DEVICE — TELEMETRIA PREDITIVA EXPONENCIAL</span>
          </div>
          <span className={`hazard-badge hazard-${(mapTelemetry?.hazardLabel || 'Seguro').toLowerCase().replace(/\s+/g, '-')}`}>
            {mapTelemetry?.hazardLabel || 'Seguro'}
          </span>
        </div>

        <div className="pred-metrics-grid">
          <div className="pred-metric-box">
            <span className="pred-label">Dificuldade D(T, A)</span>
            <strong className="pred-val" style={{ color: '#fa6400' }}>
              {mapTelemetry?.difficulty?.toLocaleString('pt-BR') || '10.0'}
            </strong>
            <small>Base D₀=10 • λ=0.28/Tier</small>
          </div>
          <div className="pred-metric-box">
            <span className="pred-label">Pack Size (N_max)</span>
            <strong className="pred-val" style={{ color: '#00e5ff' }}>
              {mapTelemetry?.maxEntities || 14} peixes
            </strong>
            <small>Teto rígido: 34 (60 FPS)</small>
          </div>
          <div className="pred-metric-box">
            <span className="pred-label">Multiplicador XP</span>
            <strong className="pred-val" style={{ color: '#34d399' }}>
              {mapTelemetry?.xpMultiplier || 1.0}x
            </strong>
            <small>{mapTelemetry?.basePreyXp || 5} XP / presa</small>
          </div>
          <div className="pred-metric-box">
            <span className="pred-label">Mult. Biomassa</span>
            <strong className="pred-val" style={{ color: '#b03af0' }}>
              {mapTelemetry?.biomassMultiplier || 1.0}x
            </strong>
            <small>Escala (D / D₀)^0.90</small>
          </div>
        </div>

        <div className="formula-strip">
          <code>
            D(T, A) = 10 · (1.28)^(T-1) · (1 + Σ w_k·a_k) · Π (1 + m_i) | N_max = 14 + min(20, ⌊1.25(T-1) + 1.5·n_afixos⌋)
          </code>
        </div>
      </div>

      {/* Seletor de Tier de Profundidade (Tier 1 a Tier 16) */}
      <div className="tier-selector-section">
        <div className="tier-header-row">
          <div>
            <strong>Tier de Profundidade: T{selectedTier} — {currentTierObj.name}</strong>
            <span className="tier-depth-tag">Profundidade: {currentTierObj.depth}</span>
          </div>
          <span className="tier-growth-pill">+28% Composto / Tier</span>
        </div>

        <input
          type="range"
          min={1}
          max={16}
          value={selectedTier}
          onChange={(e) => onChangeTier(Number(e.target.value))}
          className="tier-range-slider"
        />

        <div className="tier-buttons-strip">
          {MAP_TIERS_CATALOG.map((t) => (
            <button
              key={t.tier}
              type="button"
              className={`tier-num-btn ${selectedTier === t.tier ? 'active' : ''}`}
              onClick={() => onChangeTier(t.tier)}
              title={`Tier ${t.tier}: ${t.name} (${t.depth})`}
            >
              T{t.tier}
            </button>
          ))}
        </div>
      </div>

      {/* Seleção e Crafting de Afixos do Mapa */}
      <div className="affixes-crafting-section">
        <div className="affixes-header">
          <strong>CRAFTING DE AFIXOS DO MAPA ({selectedAffixes.length} ativos • +1.5 entidades/afixo)</strong>
          {selectedAffixes.length > 0 && (
            <button
              type="button"
              className="btn-clear-affixes"
              onClick={() => onApplyPreset(selectedTier, [])}
            >
              Limpar Afixos
            </button>
          )}
        </div>

        <div className="affixes-grid">
          {MAP_AFFIXES_CATALOG.map((affix) => {
            const isSelected = selectedAffixes.includes(affix.id);
            return (
              <div
                key={affix.id}
                className={`affix-card ${isSelected ? 'selected' : ''}`}
                style={{ borderColor: isSelected ? affix.color : undefined }}
                onClick={() => onToggleAffix(affix.id)}
              >
                <div className="affix-card-top">
                  <span className="affix-check-icon" style={{ color: isSelected ? affix.color : '#64748b' }}>
                    {isSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                  </span>
                  <strong className="affix-name">{affix.name}</strong>
                  <span className="affix-math-pill" style={{ color: affix.color }}>
                    m=+{Math.round(affix.m * 100)}% | w={affix.w}
                  </span>
                </div>
                <p className="affix-desc">{affix.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabela Comparativa de Escala e Presets Rápidos (Seção 6.4) */}
      <div className="scaling-presets-section">
        <div className="presets-title">TABELA COMPARATIVA DE ESCALA E PRESETS (SEÇÃO 6.4):</div>
        <div className="presets-table-wrapper">
          <table className="scaling-ref-table">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Afixos</th>
                <th>Dif. (D)</th>
                <th>Pack (N_max)</th>
                <th>Mult. XP</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {REFERENCE_SCALING_PRESETS.map((p) => (
                <tr key={p.label} className={selectedTier === p.tier ? 'current-row' : ''}>
                  <td><strong>{p.label}</strong></td>
                  <td>{p.affixText}</td>
                  <td style={{ color: '#fa6400' }}>{p.difficulty}</td>
                  <td style={{ color: '#00e5ff' }}>{p.maxEntities} ({p.packIncrease})</td>
                  <td style={{ color: '#34d399' }}>{p.xpMultiplier}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-load-preset"
                      onClick={() => onApplyPreset(p.tier, p.affixes)}
                    >
                      Aplicar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botão de Confirmação Expressa do Jogador (Seção 7) */}
      <div className="map-dive-footer">
        <button type="button" className="btn-confirm-dive full-width" onClick={onConfirmAndDive}>
          <Play size={18} fill="#ffffff" />
          <span>
            {expeditionState === 'derrota'
              ? 'CONFIRMAR E MERGULHAR (REINICIAR PÓS-MORTE)'
              : 'CONFIRMAR E MERGULHAR NESTE MAPA'}
          </span>
        </button>
      </div>
    </div>
  );
}
