import React from 'react';
import { Zap, ArrowLeftRight, ShieldAlert, Sparkles, Keyboard } from 'lucide-react';
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

  const getMatchingNodesForSkill = (skill) => {
    return (passiveBonuses?.allocatedNodesDetails || []).filter(n =>
      n.tags.some(t => skill.tags.includes(t))
    );
  };

  const isInverted = controlMapping?.preset === 'inverted';

  const slotsDisplay = [
    {
      idx: 0,
      label: 'HABILIDADE ATIVA 1 (SLOT PRIMÁRIO)',
      skill: slot1Skill,
      mainKey: 'Q',
      secondaryKeys: isInverted ? ['🖱️ Clique Direito'] : ['🖱️ Clique Esquerdo']
    },
    {
      idx: 1,
      label: 'HABILIDADE ATIVA 2 (SLOT SECUNDÁRIO)',
      skill: slot2Skill,
      mainKey: 'W',
      secondaryKeys: isInverted ? ['ESPAÇO', '🖱️ Clique Esquerdo'] : ['ESPAÇO', '🖱️ Clique Direito']
    }
  ];

  return (
    <div className="skills-loadout-tab">
      {/* Cabeçalho com Destaque para as Teclas de Atalho */}
      <div className="skills-pillar-banner">
        <div className="pillar-banner-header">
          <Keyboard size={17} color="#0284C7" />
          <span>SUAS 2 HABILIDADES ATIVAS E TECLAS DE ATALHO</span>
        </div>
        <p>
          Pressione a <strong>Tecla [ Q ]</strong> para ativar a <strong>Habilidade 1</strong> e a{' '}
          <strong>Tecla [ W ]</strong> (ou <strong>[ Espaço ]</strong>) para ativar a <strong>Habilidade 2</strong>!
        </p>
      </div>

      {/* Painel dos 2 Slots Equipados com Keycaps 3D Super Visíveis */}
      <div className="equipped-slots-container">
        {slotsDisplay.map(({ idx, label, skill, mainKey, secondaryKeys }) => {
          const matchingNodes = getMatchingNodesForSkill(skill);
          const hasSynergy = matchingNodes.length > 0;

          return (
            <div key={idx} className="equipped-slot-card" style={{ borderColor: skill.color }}>
              <div className="slot-card-header">
                <span className="slot-badge" style={{ background: `${skill.color}22`, color: '#1E3A5F' }}>
                  {label}
                </span>
              </div>

              {/* Bloco Super Visível de Tecla de Atalho (Keycap 3D) */}
              <div className="slot-keycap-showcase">
                <div className="keycap-main-box">
                  <span className="keycap-caption">TECLA DE ATALHO:</span>
                  <kbd className="keycap-3d-large">[{mainKey}]</kbd>
                </div>
                <div className="keycap-extra-list">
                  {secondaryKeys.map((sk) => (
                    <kbd key={sk} className="keycap-3d-sub">
                      {sk}
                    </kbd>
                  ))}
                </div>
              </div>

              <div className="slot-skill-main">
                <div className="slot-skill-icon" style={{ background: `${skill.color}22`, borderColor: skill.color }}>
                  <span>{skill.icon}</span>
                  <span className="icon-corner-key">{mainKey}</span>
                </div>
                <div className="slot-skill-text">
                  <h4>{skill.name}</h4>
                  <p className="slot-skill-effect-desc">{skill.description}</p>
                </div>
              </div>

              <div className="slot-metrics-grid two-cols">
                <div className="slot-metric">
                  <span>Custo de Uso</span>
                  <strong style={{ color: skill.resourceType === 'frenesi' ? '#e11d48' : '#0284c7' }}>
                    {skill.cost} {skill.resourceType === 'frenesi' ? 'Frenesi' : 'Fôlego'}
                  </strong>
                </div>
                <div className="slot-metric">
                  <span>Tempo de Recarga</span>
                  <strong>{skill.cooldown}s</strong>
                </div>
              </div>

              {/* Indicador Amigável de Passivas Conectadas (Sem Porcentagens) */}
              <div className={`slot-synergy-box ${hasSynergy ? 'synergy-good' : 'synergy-warn'}`}>
                {hasSynergy ? (
                  <>
                    <Sparkles size={14} color="#059669" />
                    <span>
                      Fortalecida por passivas da árvore!
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={14} color="#d97706" />
                    <span>
                      Dica: Escolha esferas na Aba de Passivas para deixar esta habilidade mais forte!
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
          <span>Inverter Habilidades [Tecla Q] ↔ [Tecla W]</span>
        </button>

        <div className="mapping-selector">
          <span>Botões do Mouse:</span>
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
            <option value="default">Padrão: [Tecla Q + Clique Esq.] • [Tecla W + Clique Dir. + Espaço]</option>
            <option value="inverted">Invertido: [Tecla Q + Clique Dir.] • [Tecla W + Clique Esq. + Espaço]</option>
          </select>
        </div>
      </div>

      {/* Catálogo Completo das 5 Habilidades */}
      <div className="skills-catalog-section">
        <h4 className="catalog-section-title">ESCOLHA QUAL HABILIDADE ATIVAR EM CADA TECLA DE ATALHO:</h4>
        <div className="skills-catalog-list">
          {SKILLS_CATALOG.map((skill) => {
            const inSlot1 = equippedIds[0] === skill.id;
            const inSlot2 = equippedIds[1] === skill.id;

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
                      {inSlot1 && <span className="equipped-key-tag key-q">ATIVA NA TECLA [ Q ]</span>}
                      {inSlot2 && <span className="equipped-key-tag key-w">ATIVA NA TECLA [ W ]</span>}
                    </div>
                    <div className="cat-skill-tags">
                      <span className="mini-cost">
                        Custo: {skill.cost} {skill.resourceType === 'frenesi' ? 'Cargas Frenesi' : 'Fôlego'} • Recarga: {skill.cooldown}s
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
                    {inSlot1 ? '✔ Ativa na Tecla [ Q ]' : 'Usar na Tecla [ Q ]'}
                  </button>
                  <button
                    type="button"
                    className={`btn-equip-slot ${inSlot2 ? 'active-slot2' : ''}`}
                    onClick={() => handleEquipToSlot(skill.id, 1)}
                  >
                    {inSlot2 ? '✔ Ativa na Tecla [ W ]' : 'Usar na Tecla [ W ]'}
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
