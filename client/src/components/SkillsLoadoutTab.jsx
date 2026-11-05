import React from 'react';
import { Zap, ArrowLeftRight, ShieldAlert, CheckCircle2, Sparkles, MousePointerClick } from 'lucide-react';
import { SKILLS_CATALOG } from '../data/gameCatalog';

export default function SkillsLoadoutTab({
  profile,
  passiveBonuses,
  controlMapping,
  onUpdateControlMapping,
  onEquipSkills
}) {
  const equippedIds = profile?.habilidadesEquipadas || ['snap_strike', 'tail_sweep'];
  const slot1Skill = SKILLS_CATALOG.find(s => s.id === equippedIds[0]) || SKILLS_CATALOG[0];
  const slot2Skill = SKILLS_CATALOG.find(s => s.id === equippedIds[1]) || SKILLS_CATALOG[1];

  const handleEquipToSlot = (skillId, targetSlotIndex) => {
    const next = [...equippedIds];
    const otherSlotIndex = targetSlotIndex === 0 ? 1 : 0;

    // Se a habilidade já estiver no outro slot, inverte os 2 slots
    if (next[otherSlotIndex] === skillId) {
      const temp = next[targetSlotIndex];
      next[targetSlotIndex] = skillId;
      next[otherSlotIndex] = temp;
    } else {
      next[targetSlotIndex] = skillId;
    }
    onEquipSkills(next);
  };

  const handleSwapSlots = () => {
    onEquipSkills([equippedIds[1], equippedIds[0]]);
  };

  const computeSkillDetails = (skill) => {
    const tagMults = passiveBonuses?.tagMultipliers || {};
    let totalTagMultiplier = 1.0;
    const activeMatchingTags = [];

    (skill.tags || []).forEach((tag) => {
      const m = tagMults[tag] || 1.0;
      totalTagMultiplier *= m;
      if (m > 1.0) {
        activeMatchingTags.push({ tag, bonusPct: Math.round((m - 1) * 100) });
      }
    });

    const cdr = Math.min(0.65, Math.max(0, passiveBonuses?.cooldownReduction || 0));
    const effectiveCd = Number((skill.cooldown * (1 - cdr)).toFixed(2));
    const costMult = skill.resourceType === 'folego' ? Math.max(0.4, 1 + (passiveBonuses?.folegoCostMultiplier || 0)) : 1.0;
    const effectiveCost = Math.round(skill.cost * costMult);
    const effectiveDamage = Math.round(skill.baseDamage * totalTagMultiplier);

    const matchingNodes = (passiveBonuses?.allocatedNodesDetails || []).filter(n =>
      n.tags.some(t => skill.tags.includes(t))
    );

    return {
      totalTagMultiplier,
      activeMatchingTags,
      effectiveCd,
      effectiveCost,
      effectiveDamage,
      matchingNodes
    };
  };

  return (
    <div className="skills-loadout-tab">
      {/* Cabeçalho Explicativo: Restrição a Apenas 2 Habilidades Habilitadas */}
      <div className="skills-pillar-banner">
        <div className="pillar-banner-header">
          <Zap size={16} color="#fa6400" />
          <span>SISTEMA LIMITANTE DE 2 SLOTS HABILITADOS & SINERGIA DE TAGS</span>
        </div>
        <p>
          Apenas <strong>2 habilidades ativas</strong> podem ser equipadas simultaneamente na expedição. Habilidades sem
          passivas correspondentes às suas <strong>[Tags]</strong> terão eficácia medíocre.
        </p>
      </div>

      {/* Painel dos 2 Slots Equipados + Painel de Sinergia em Tempo Real */}
      <div className="equipped-slots-container">
        {[
          { idx: 0, label: 'SLOT 1 (Habilidade Primária)', skill: slot1Skill, keyBind: controlMapping?.slot1 || 'Q / Clique Esquerdo' },
          { idx: 1, label: 'SLOT 2 (Habilidade Secundária / Suporte)', skill: slot2Skill, keyBind: controlMapping?.slot2 || 'W / Clique Direito / Espaço' }
        ].map(({ idx, label, skill, keyBind }) => {
          const details = computeSkillDetails(skill);
          const hasSynergy = details.matchingNodes.length > 0;

          return (
            <div key={idx} className="equipped-slot-card" style={{ borderColor: skill.color }}>
              <div className="slot-card-header">
                <span className="slot-badge" style={{ background: `${skill.color}25`, color: skill.color }}>
                  {label}
                </span>
                <span className="slot-keybind-pill">
                  <MousePointerClick size={12} /> {keyBind}
                </span>
              </div>

              <div className="slot-skill-main">
                <div className="slot-skill-icon" style={{ background: `${skill.color}20`, borderColor: skill.color }}>
                  {skill.icon}
                </div>
                <div className="slot-skill-text">
                  <h4>{skill.name}</h4>
                  <div className="slot-tags-list">
                    {skill.tags.map((tag) => {
                      const tagBoost = Math.round(((passiveBonuses?.tagMultipliers?.[tag] || 1) - 1) * 100);
                      return (
                        <span key={tag} className={`skill-tag-badge ${tagBoost > 0 ? 'synergy-active' : ''}`}>
                          [{tag}] {tagBoost > 0 ? `+${tagBoost}%` : ''}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="slot-metrics-grid">
                <div className="slot-metric">
                  <span>Dano Efetivo</span>
                  <strong style={{ color: '#00e5ff' }}>{details.effectiveDamage} ({Math.round(details.totalTagMultiplier * 100)}%)</strong>
                </div>
                <div className="slot-metric">
                  <span>Custo</span>
                  <strong style={{ color: skill.resourceType === 'frenesi' ? '#f43f5e' : '#38bdf8' }}>
                    {details.effectiveCost} {skill.resourceType === 'frenesi' ? 'Frenesi' : 'Fôlego'}
                  </strong>
                </div>
                <div className="slot-metric">
                  <span>Cooldown</span>
                  <strong>{details.effectiveCd}s</strong>
                </div>
              </div>

              {/* Painel de Sinergia com a Árvore de Passivas */}
              <div className={`slot-synergy-box ${hasSynergy ? 'synergy-good' : 'synergy-warn'}`}>
                {hasSynergy ? (
                  <>
                    <Sparkles size={13} color="#34d399" />
                    <span>
                      Potencializada por <strong>{details.matchingNodes.length} nós</strong> da Árvore (
                      {details.matchingNodes.slice(0, 2).map(n => n.name).join(', ')}
                      {details.matchingNodes.length > 2 ? '...' : ''})
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={13} color="#f59e0b" />
                    <span>
                      Alerta de Sinergia: Nenhum nó alocado para {skill.tags.map(t => `[${t}]`).join(' ')}. Aloque passivas na Aba 1!
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controles de Troca Rápida e Mapeamento de Atalhos */}
      <div className="controls-mapping-bar">
        <button type="button" className="btn-swap-slots" onClick={handleSwapSlots}>
          <ArrowLeftRight size={14} />
          <span>Inverter Slot 1 ↔ Slot 2</span>
        </button>

        <div className="mapping-selector">
          <span>Mapeamento:</span>
          <select
            value={controlMapping?.preset || 'default'}
            onChange={(e) => {
              const preset = e.target.value;
              if (preset === 'inverted') {
                onUpdateControlMapping({
                  preset: 'inverted',
                  slot1: 'Q / Clique Direito',
                  slot2: 'W / Clique Esquerdo / Espaço'
                });
              } else {
                onUpdateControlMapping({
                  preset: 'default',
                  slot1: 'Q / Clique E',
                  slot2: 'W / Clique D / Espaço'
                });
              }
            }}
          >
            <option value="default">Padrão: Slot 1 [Q / Clique E] • Slot 2 [W / Clique D / Espaço]</option>
            <option value="inverted">Tático: Slot 1 [Q / Clique D] • Slot 2 [W / Clique E / Espaço]</option>
          </select>
        </div>
      </div>

      {/* Catálogo Completo das 5 Habilidades (Seção 4.2) */}
      <div className="skills-catalog-section">
        <h4 className="catalog-section-title">CATÁLOGO DE HABILIDADES ABISSAIS (ESCOLHA APENAS 2)</h4>
        <div className="skills-catalog-list">
          {SKILLS_CATALOG.map((skill) => {
            const inSlot1 = equippedIds[0] === skill.id;
            const inSlot2 = equippedIds[1] === skill.id;
            const details = computeSkillDetails(skill);

            return (
              <div
                key={skill.id}
                className={`catalog-skill-item ${inSlot1 || inSlot2 ? 'is-equipped' : ''}`}
              >
                <div className="cat-skill-left">
                  <div className="cat-skill-icon" style={{ color: skill.color, borderColor: skill.color }}>
                    {skill.icon}
                  </div>
                  <div className="cat-skill-body">
                    <div className="cat-skill-title-row">
                      <strong>{skill.name}</strong>
                      <span className="cat-typical-slot">{skill.typicalSlot}</span>
                    </div>
                    <div className="cat-skill-tags">
                      {skill.tags.map(t => (
                        <span key={t} className="mini-tag">[{t}]</span>
                      ))}
                      <span className="mini-cost">
                        • {skill.cost} {skill.resourceType === 'frenesi' ? 'Cargas Frenesi' : 'Fôlego'} • CD {skill.cooldown}s
                      </span>
                      <span className="mini-synergy">
                        • Sinergia Atual: <strong>{Math.round(details.totalTagMultiplier * 100)}%</strong>
                      </span>
                    </div>
                    <p className="cat-skill-desc">{skill.description}</p>
                  </div>
                </div>

                <div className="cat-skill-actions">
                  <button
                    type="button"
                    className={`btn-equip-slot ${inSlot1 ? 'active-slot1' : ''}`}
                    onClick={() => handleEquipToSlot(skill.id, 0)}
                  >
                    {inSlot1 ? '✔ No Slot 1' : 'Equipar Slot 1'}
                  </button>
                  <button
                    type="button"
                    className={`btn-equip-slot ${inSlot2 ? 'active-slot2' : ''}`}
                    onClick={() => handleEquipToSlot(skill.id, 1)}
                  >
                    {inSlot2 ? '✔ No Slot 2' : 'Equipar Slot 2'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
