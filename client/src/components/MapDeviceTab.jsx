import React from 'react';
import { Play, CheckSquare, Square, Palette } from 'lucide-react';
import {
  MAP_TIERS_CATALOG,
  MAP_AFFIXES_CATALOG,
  DIFFICULTY_COLOR_SCALE,
  getDifficultyColorInfo,
  getTierColorInfo
} from '../data/gameCatalog';

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
  const activeColorInfo = getDifficultyColorInfo(mapTelemetry?.difficulty, selectedTier);

  return (
    <div className="map-device-tab">
      {/* Painel Principal: Informativo Colorido de Dificuldade (Sem Nome da Cor no Texto) */}
      <div
        className="difficulty-color-indicator-card"
        style={{
          borderColor: activeColorInfo.color,
          background: `linear-gradient(135deg, ${activeColorInfo.bgLight} 0%, #FFFFFF 100%)`
        }}
      >
        <div className="diff-color-header">
          <div className="diff-color-title">
            <Palette size={18} color={activeColorInfo.color} />
            <span>INDICADOR DE DIFICULDADE</span>
          </div>
          <span
            className="diff-active-color-pill"
            style={{
              backgroundColor: activeColorInfo.color,
              color: activeColorInfo.id === 'amarelo' ? '#1E3A5F' : '#FFFFFF'
            }}
          >
            {activeColorInfo.label}
          </span>
        </div>

        <p className="diff-color-description" style={{ color: activeColorInfo.textColor }}>
          {activeColorInfo.description}
        </p>

        {/* Escala Cromática Visual de 6 Níveis (Exibindo Apenas o Conteúdo Sequente) */}
        <div className="difficulty-color-scale">
          {DIFFICULTY_COLOR_SCALE.map((item) => {
            const isActive = item.id === activeColorInfo.id;
            return (
              <div
                key={item.id}
                className={`color-scale-step ${isActive ? 'active-step' : ''}`}
                style={{
                  backgroundColor: item.bgLight,
                  borderColor: isActive ? item.color : 'rgba(148, 163, 184, 0.35)'
                }}
              >
                <span
                  className="color-scale-swatch"
                  style={{ backgroundColor: item.color }}
                />
                <span className="color-scale-name" style={{ color: item.textColor }}>
                  {item.shortName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seletor de Zona / Mapa Colorido por Faixa de Dificuldade */}
      <div className="tier-selector-section">
        <div className="tier-header-row">
          <div>
            <strong>Zona Submarina: {currentTierObj.name}</strong>
          </div>
          <span
            className="tier-color-tag"
            style={{
              backgroundColor: activeColorInfo.bgLight,
              color: activeColorInfo.textColor,
              border: `1.5px solid ${activeColorInfo.color}`
            }}
          >
            <span className="color-dot-inline" style={{ backgroundColor: activeColorInfo.color }} />
            {activeColorInfo.shortName}
          </span>
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
          {MAP_TIERS_CATALOG.map((t) => {
            const tColor = getTierColorInfo(t.tier);
            const isSelected = selectedTier === t.tier;
            return (
              <button
                key={t.tier}
                type="button"
                className={`tier-num-btn ${isSelected ? 'active' : ''}`}
                style={{
                  borderColor: tColor.color,
                  backgroundColor: isSelected ? tColor.color : tColor.bgLight,
                  color: isSelected
                    ? (tColor.id === 'amarelo' ? '#1E3A5F' : '#FFFFFF')
                    : tColor.textColor
                }}
                onClick={() => onChangeTier(t.tier)}
                title={`${t.name} (${tColor.label})`}
              >
                <span
                  className="tier-mini-dot"
                  style={{ backgroundColor: isSelected ? '#FFFFFF' : tColor.color }}
                />
                Z{t.tier}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modificadores do Mar com Informativo Colorido (Apenas Conteúdo da Categoria) */}
      <div className="affixes-crafting-section">
        <div className="affixes-header">
          <strong>DESAFIOS DO MAR</strong>
          {selectedAffixes.length > 0 && (
            <button
              type="button"
              className="btn-clear-affixes"
              onClick={() => onApplyPreset(selectedTier, [])}
            >
              Limpar Desafios
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
                style={{
                  borderColor: isSelected ? affix.color : undefined,
                  backgroundColor: isSelected ? `${affix.color}18` : undefined
                }}
                onClick={() => onToggleAffix(affix.id)}
              >
                <div className="affix-card-top">
                  <span className="affix-check-icon" style={{ color: isSelected ? affix.color : '#64748b' }}>
                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </span>
                  <strong className="affix-name">{affix.name}</strong>
                  <span
                    className="affix-color-pill"
                    style={{
                      backgroundColor: `${affix.color}22`,
                      borderColor: affix.color,
                      color: '#1E3A5F'
                    }}
                  >
                    <span className="color-dot-inline" style={{ backgroundColor: affix.color }} />
                    {affix.category}
                  </span>
                </div>
                <p className="affix-desc">{affix.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botão de Confirmação Expressa do Jogador */}
      <div className="map-dive-footer">
        <button type="button" className="btn-confirm-dive full-width" onClick={onConfirmAndDive}>
          <Play size={18} fill="#ffffff" />
          <span>
            {expeditionState === 'derrota'
              ? 'CONFIRMAR E MERGULHAR NOVAMENTE'
              : 'CONFIRMAR E MERGULHAR NESTE OCEANO'}
          </span>
        </button>
      </div>
    </div>
  );
}
