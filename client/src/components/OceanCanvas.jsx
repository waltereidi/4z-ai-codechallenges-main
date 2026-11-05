import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Skull, ShieldAlert, Zap, Compass, Crosshair, Flame, Sparkles } from 'lucide-react';
import { SKILLS_CATALOG, BESTIARY_CATALOG, RARE_AFFIXES_CATALOG } from '../data/gameCatalog';

export default function OceanCanvas({
  profile,
  passiveBonuses,
  mapTelemetry,
  expeditionState, // 'pronto' | 'em_andamento' | 'pausado' | 'derrota'
  deathReport,
  controlMapping,
  onStartExpedition,
  onTogglePause,
  onExpeditionDeath,
  onLiveTelemetryUpdate,
  onLiveProgressGain,
  onCombatLogEvent,
  onSelectTab
}) {
  const canvasRef = useRef(null);
  const [skillCooldownsUi, setSkillCooldownsUi] = useState({ slot1: 0, slot2: 0 });
  const [navStateBadge, setNavStateBadge] = useState({
    mode: 'PATRULHA_AUTOMATICA',
    subState: 'Nado Autônomo',
    targetX: null,
    targetY: null
  });

  // Referências mutáveis para que mudanças nas abas da direita NUNCA reiniciem ou travem o Canvas
  const propsRef = useRef({
    profile,
    passiveBonuses,
    mapTelemetry,
    expeditionState,
    controlMapping,
    onExpeditionDeath,
    onLiveTelemetryUpdate,
    onLiveProgressGain,
    onCombatLogEvent
  });

  useEffect(() => {
    propsRef.current = {
      profile,
      passiveBonuses,
      mapTelemetry,
      expeditionState,
      controlMapping,
      onExpeditionDeath,
      onLiveTelemetryUpdate,
      onLiveProgressGain,
      onCombatLogEvent
    };
  }, [
    profile,
    passiveBonuses,
    mapTelemetry,
    expeditionState,
    controlMapping,
    onExpeditionDeath,
    onLiveTelemetryUpdate,
    onLiveProgressGain,
    onCombatLogEvent
  ]);

  // Estado completo do mundo físico 2D em useRef (60 FPS sem re-renders do React)
  const worldRef = useRef({
    width: 780,
    height: 540,
    mouseX: 390,
    mouseY: 270,
    runStartTime: Date.now(),
    elapsedSeconds: 0,
    killsCount: 0,
    preyDevouredCount: 0,
    runXpGained: 0,
    runBiomassGained: 0,
    unsyncedXp: 0,
    unsyncedBiomass: 0,
    damageTakenBySource: {},
    shark: {
      x: 220,
      y: 260,
      vx: 65,
      vy: 15,
      angle: 0,
      facingLeft: false,
      hp: 180,
      maxHp: 180,
      folego: 100,
      maxFolego: 100,
      frenzyCharges: 0,
      maxFrenzyCharges: 3,
      // Máquina de Estados Estrita (Seção 4.3)
      state: 'PATRULHA_AUTOMATICA', // 'PATRULHA_AUTOMATICA' | 'COMANDO_MANUAL'
      subState: 'Patrulha', // 'DeslocamentoVetorial' | 'ExecucaoAcao' | 'AcaoConcluida'
      targetX: null,
      targetY: null,
      pendingSlotIndex: null,
      patrolWaypointX: 520,
      patrolWaypointY: 240,
      biteAnimTimer: 0,
      tailSweepAnimTimer: 0,
      iframeTimer: 0,
      stunTimer: 0,
      bleedTimer: 0,
      bleedDps: 0,
      poisonTimer: 0,
      poisonDps: 0,
      cryoSlowed: false,
      megalodonBuffTimer: 0,
      autoCastTimer: 0,
      cooldowns: { slot1: 0, slot2: 0 }
    },
    entities: [], // Presas e Inimigos do Mar
    projectiles: [], // Dentículos do Tubarão e Raios/Espinhos Inimigos
    shockwaves: [], // Vórtices e Áreas Telegrafadas do Leviatã
    biomassOrbs: [], // Orbes magnéticos de biomassa
    floatingTexts: [], // Log de dano flutuante no Canvas
    bubbles: Array.from({ length: 28 }, () => ({
      x: Math.random() * 780,
      y: Math.random() * 540,
      r: 1.5 + Math.random() * 4,
      speed: 18 + Math.random() * 28
    }))
  });

  const addFloatingText = useCallback((x, y, text, color = '#ffffff', size = 13, isCrit = false) => {
    const w = worldRef.current;
    w.floatingTexts.push({
      id: Math.random(),
      x,
      y,
      vy: isCrit ? -46 : -32,
      text,
      color,
      size: isCrit ? size + 4 : size,
      alpha: 1.0,
      life: isCrit ? 1.25 : 0.95
    });
    if (w.floatingTexts.length > 40) {
      w.floatingTexts.shift();
    }
  }, []);

  // Calcula o multiplicador sinérgico de uma habilidade com base nas Tags e Passivas alocadas
  const computeSkillSynergyMultiplier = useCallback((skill) => {
    const bonuses = propsRef.current.passiveBonuses;
    const shark = worldRef.current.shark;
    if (!skill || !bonuses) return 1.0;

    let tagMult = 1.0;
    let matchedTags = 0;
    (skill.tags || []).forEach((tag) => {
      const m = bonuses.tagMultipliers?.[tag] || 1.0;
      if (m > 1.0) matchedTags++;
      tagMult *= m;
    });

    // Se nenhuma passiva sinergizar com as tags da habilidade, eficácia base é contida (Seção 4.1.3)
    const frenzyBonus = 1 + shark.frenzyCharges * (bonuses.damagePerFrenzy || 0.06);
    const megalodonBonus = shark.megalodonBuffTimer > 0 ? 2.0 * (bonuses.tagMultipliers?.Buff || 1.0) : 1.0;

    return tagMult * frenzyBonus * megalodonBonus;
  }, []);

  // Spawna uma entidade marinha (Presa ou Inimigo do Mar) respeitando N_max(T, A)
  const spawnMarineEntity = useCallback((forceType = null) => {
    const w = worldRef.current;
    const { mapTelemetry: tele } = propsRef.current;
    const maxEntities = tele?.maxEntities || 14;
    if (w.entities.length >= maxEntities && !forceType) return;

    const tier = tele?.tier || 1;
    const difficulty = tele?.difficulty || 10;
    const activeAffixes = tele?.activeAffixes || [];

    const preyCount = w.entities.filter(e => e.isPrey).length;
    const targetPrey = tele?.preyCountTarget || 8;

    let chosenTemplate = BESTIARY_CATALOG[0];
    let isPrey = true;

    if (forceType) {
      chosenTemplate = BESTIARY_CATALOG.find(b => b.id === forceType) || BESTIARY_CATALOG[0];
      isPrey = chosenTemplate.id === 'presa_comum';
    } else if (preyCount < targetPrey && Math.random() < 0.62) {
      chosenTemplate = BESTIARY_CATALOG[0];
      isPrey = true;
    } else {
      isPrey = false;
      // Pool de inimigos conforme Tier e Afixos do Mapa
      const hasBossAlready = w.entities.some(e => e.type === 'leviata_abissal');
      const wantsBoss = (activeAffixes.includes('leviata_supremo') || tier >= 12) && !hasBossAlready && Math.random() < 0.16;

      if (wantsBoss) {
        chosenTemplate = BESTIARY_CATALOG.find(b => b.id === 'leviata_abissal');
      } else {
        const enemyPool = [
          BESTIARY_CATALOG[1], // Água-viva Tóxica
          BESTIARY_CATALOG[2], // Enguia Elétrica
          BESTIARY_CATALOG[3], // Caranguejo Couraçado
          BESTIARY_CATALOG[4]  // Peixe-Pescador Abissal
        ];
        // Ponderação por afixos ativos
        let idx = Math.floor(Math.random() * enemyPool.length);
        if (activeAffixes.includes('enguias_eletricas') && Math.random() < 0.45) idx = 1;
        else if (activeAffixes.includes('cardumes_toxicos') && Math.random() < 0.45) idx = 0;
        else if (activeAffixes.includes('reflexo_dano') && Math.random() < 0.42) idx = 2;
        chosenTemplate = enemyPool[idx];
      }
    }

    // Escalonamento de HP e Dano com a Dificuldade D(T, A)
    const diffScale = Math.pow(Math.max(1, difficulty / 10), 0.38);
    const damageScale = Math.pow(Math.max(1, difficulty / 10), 0.25);
    const speedBonus = activeAffixes.includes('mare_rapida') ? 1.20 : 1.0;

    // Chance de Inimigo Raro com Aura Archnemesis (Seção 3.3)
    let rareAffix = null;
    if (!isPrey) {
      const rareChance = (activeAffixes.includes('inimigos_raros') ? 0.38 : 0.14) + tier * 0.012;
      if (Math.random() < rareChance) {
        rareAffix = RARE_AFFIXES_CATALOG[Math.floor(Math.random() * RARE_AFFIXES_CATALOG.length)];
      }
    }

    const hpMultiplier = rareAffix ? 1.75 : 1.0;
    const maxHp = Math.round(chosenTemplate.baseHp * diffScale * hpMultiplier);

    const spawnFromLeft = Math.random() < 0.5;
    const x = spawnFromLeft ? 35 + Math.random() * 90 : w.width - (35 + Math.random() * 90);
    let y = 65 + Math.random() * (w.height - 140);
    if (chosenTemplate.id === 'caranguejo_couracado') {
      y = w.height - 46 - Math.random() * 16; // Leito oceânico
    }

    w.entities.push({
      id: 'ent_' + Math.random().toString(36).substring(2, 9),
      type: chosenTemplate.id,
      name: rareAffix ? `${chosenTemplate.name} [${rareAffix.name}]` : chosenTemplate.name,
      isPrey,
      isBoss: chosenTemplate.id === 'leviata_abissal',
      x,
      y,
      baseY: y,
      vx: (spawnFromLeft ? 1 : -1) * chosenTemplate.speed * speedBonus * (0.85 + Math.random() * 0.3),
      vy: (Math.random() - 0.5) * 28,
      speed: chosenTemplate.speed * speedBonus,
      radius: chosenTemplate.id === 'leviata_abissal' ? 42 : isPrey ? 14 : 22,
      hp: maxHp,
      maxHp,
      damage: chosenTemplate.baseDamage * damageScale * (rareAffix ? 1.25 : 1.0),
      damageType: chosenTemplate.damageType,
      baseXp: chosenTemplate.baseXp,
      baseBiomass: chosenTemplate.baseBiomass,
      color: chosenTemplate.color,
      rareAffix,
      attackCooldown: 1.2 + Math.random() * 1.5,
      bleedTimer: 0,
      bleedDps: 0,
      poisonTimer: 0,
      poisonDps: 0,
      stunTimer: 0,
      phaseOffset: Math.random() * Math.PI * 2
    });
  }, []);

  // Reinicializa o oceano ao iniciar nova expedição
  const resetWorldForExpedition = useCallback(() => {
    const w = worldRef.current;
    const bonuses = propsRef.current.passiveBonuses || {};
    const tele = propsRef.current.mapTelemetry || { maxEntities: 14, tier: 1 };

    const maxHp = Math.round(180 * (1 + (bonuses.maxHpPct || 0)));
    const maxFolego = Math.round(100 * (1 + (bonuses.maxFolegoPct || 0)));
    const maxFrenzy = Math.min(5, Math.max(3, bonuses.maxFrenzyCharges || 3));

    w.runStartTime = Date.now();
    w.elapsedSeconds = 0;
    w.killsCount = 0;
    w.preyDevouredCount = 0;
    w.runXpGained = 0;
    w.runBiomassGained = 0;
    w.unsyncedXp = 0;
    w.unsyncedBiomass = 0;
    w.damageTakenBySource = {};

    w.shark = {
      ...w.shark,
      x: w.width * 0.28,
      y: w.height * 0.5,
      vx: 70,
      vy: 0,
      angle: 0,
      facingLeft: false,
      hp: maxHp,
      maxHp,
      folego: maxFolego,
      maxFolego,
      frenzyCharges: 0,
      maxFrenzyCharges: maxFrenzy,
      state: 'PATRULHA_AUTOMATICA',
      subState: 'Nado Autônomo',
      targetX: null,
      targetY: null,
      pendingSlotIndex: null,
      patrolWaypointX: w.width * 0.72,
      patrolWaypointY: w.height * 0.45,
      biteAnimTimer: 0,
      tailSweepAnimTimer: 0,
      iframeTimer: 0.8,
      stunTimer: 0,
      bleedTimer: 0,
      bleedDps: 0,
      poisonTimer: 0,
      poisonDps: 0,
      cryoSlowed: false,
      megalodonBuffTimer: 0,
      autoCastTimer: 0,
      cooldowns: { slot1: 0, slot2: 0 }
    };

    w.entities = [];
    w.projectiles = [];
    w.shockwaves = [];
    w.biomassOrbs = [];
    w.floatingTexts = [];

    const initialCount = tele.maxEntities || 14;
    for (let i = 0; i < initialCount; i++) {
      spawnMarineEntity(i < Math.ceil(initialCount * 0.55) ? 'presa_comum' : null);
    }
    if ((tele.activeAffixes || []).includes('leviata_supremo')) {
      spawnMarineEntity('leviata_abissal');
    }
  }, [spawnMarineEntity]);

  // Processa abate/devoramento de entidade marinha
  const handleEntityDefeated = useCallback((ent) => {
    const w = worldRef.current;
    const shark = w.shark;
    const bonuses = propsRef.current.passiveBonuses || {};
    const tele = propsRef.current.mapTelemetry || { difficulty: 10, xpMultiplier: 1, biomassMultiplier: 1 };

    // Cálculo Exato de XP (Seção 6.3):
    // XP_Inimigo = Base_XP * (1 + D(T, A) / D0)^1.25 * (1 + Mod_Passivas)
    const D0 = 10;
    const D = tele.difficulty || 10;
    const xpMult = Math.pow(D / D0, 1.29) * (1 + (bonuses.xpMultiplierPct || 0));
    let gainedXp = ent.baseXp * xpMult * (ent.rareAffix ? 1.8 : 1.0);

    if (ent.isPrey) {
      w.preyDevouredCount += 1;
      // Recompensa oficial de Presa Comum (Seção 3.2):
      // Recupera 10% de HP, restaura 15 de Fôlego e gera 1 Carga de Frenesi
      const healPct = 0.10 + (bonuses.extraPreyHealPct || 0);
      const healAmount = Math.round(shark.maxHp * healPct);
      const folegoRestore = 15 + (bonuses.extraPreyFolego || 0);
      const frenzyAdd = bonuses.doubleFrenzyOnPrey ? 2 : 1;

      shark.hp = Math.min(shark.maxHp, shark.hp + healAmount);
      shark.folego = Math.min(shark.maxFolego, shark.folego + folegoRestore);
      shark.frenzyCharges = Math.min(shark.maxFrenzyCharges, shark.frenzyCharges + frenzyAdd);

      // Keystone Vórtice Voraz: 15% de chance de explodir com XP em dobro
      if (bonuses.preyExplosionChance > 0 && Math.random() < bonuses.preyExplosionChance) {
        gainedXp *= 2;
        addFloatingText(ent.x, ent.y - 18, `💥 EXPLOSÃO VORAZ! +${gainedXp.toFixed(0)} XP`, '#facc15', 14, true);
      } else {
        addFloatingText(ent.x, ent.y - 10, `+${healAmount} HP | +${folegoRestore} Fôlego | +${frenzyAdd} Frenesi`, '#34d399', 11);
      }
    } else {
      w.killsCount += 1;
      if (bonuses.killFolegoRestore > 0) {
        shark.folego = Math.min(shark.maxFolego, shark.folego + bonuses.killFolegoRestore);
      }
      if (bonuses.killHpRestorePct > 0) {
        shark.hp = Math.min(shark.maxHp, shark.hp + shark.maxHp * bonuses.killHpRestorePct);
      }

      // Afixo Raro: Lorde dos Espinhos -> explode em 8 dentes pontiagudos em todas as direções (Seção 3.3)
      if (ent.rareAffix && ent.rareAffix.id === 'lorde_espinhos') {
        addFloatingText(ent.x, ent.y - 22, '💥 LORDE DOS ESPINHOS: 8 FARPAS!', '#f97316', 13, true);
        for (let k = 0; k < 8; k++) {
          const ang = (k * Math.PI * 2) / 8;
          w.projectiles.push({
            id: Math.random(),
            fromShark: false,
            x: ent.x,
            y: ent.y,
            vx: Math.cos(ang) * 230,
            vy: Math.sin(ang) * 230,
            radius: 6,
            damage: ent.damage * 0.85,
            damageType: 'Explosão de Lorde dos Espinhos',
            stunDuration: 0,
            color: '#f97316',
            life: 2.2
          });
        }
      }
    }

    const biomassGain = ent.baseBiomass * (tele.biomassMultiplier || 1) * (ent.rareAffix ? 1.6 : 1.0);

    // Gera orbe de biomassa para coleta ou sucção eletrossensorial
    w.biomassOrbs.push({
      id: Math.random(),
      x: ent.x,
      y: ent.y,
      amount: biomassGain,
      xpAmount: gainedXp,
      color: ent.isPrey ? '#38bdf8' : '#b03af0',
      life: 10
    });

    if (propsRef.current.onCombatLogEvent) {
      propsRef.current.onCombatLogEvent({
        type: ent.isPrey ? 'prey' : 'kill',
        text: ent.isPrey
          ? `Devorou Presa (+10% HP, +15 Fôlego, +1 Frenesi, +${gainedXp.toFixed(1)} XP)`
          : `Abateu ${ent.name} (+${gainedXp.toFixed(1)} XP, +${biomassGain.toFixed(1)} Biomassa)`
      });
    }
  }, [addFloatingText]);

  // Aplica dano de habilidade do Tubarão Alfa em um alvo
  const dealSharkDamageToEntity = useCallback((ent, rawDamage, skill, sourceAngle = 0) => {
    const w = worldRef.current;
    const shark = w.shark;
    const bonuses = propsRef.current.passiveBonuses || {};

    let finalDamage = rawDamage * computeSkillSynergyMultiplier(skill);

    // Crítico
    const critChance = Math.min(0.85, (bonuses.critChance || 0.08) + shark.frenzyCharges * 0.03);
    const isCrit = Math.random() < critChance;
    if (isCrit) {
      finalDamage *= (bonuses.critMulti || 1.5);
      // Keystone Banquete de Sangue: críticos geram Frenesi
      if (bonuses.critFrenzyGen) {
        shark.frenzyCharges = Math.min(shark.maxFrenzyCharges, shark.frenzyCharges + 1);
      }
    }

    // Mecânica do Caranguejo Couraçado (Seção 3.2):
    // Carapaça frontal reduz dano recebido em 75% e reflete espinhos
    if (ent.type === 'caranguejo_couracado') {
      const hitFromFront = (ent.vx >= 0 && shark.x > ent.x) || (ent.vx < 0 && shark.x < ent.x);
      const armorPen = Math.min(1.0, bonuses.armorPenetration || 0);
      if (hitFromFront && armorPen < 1.0) {
        const reduction = 0.75 * (1 - armorPen);
        finalDamage *= (1 - reduction);
        addFloatingText(ent.x, ent.y - 24, `🛡️ CARAPAÇA -${Math.round(reduction * 100)}%`, '#f97316', 11);
      }
      // Reflexo de espinhos
      if (!bonuses.reflectImmunity && shark.iframeTimer <= 0) {
        const reflectDmg = Math.max(2, ent.damage * 0.35 * (1 - (bonuses.armorPct || 0)));
        shark.hp = Math.max(0, shark.hp - reflectDmg);
        w.damageTakenBySource['Espinhos Refletidos (Caranguejo Couraçado)'] =
          (w.damageTakenBySource['Espinhos Refletidos (Caranguejo Couraçado)'] || 0) + reflectDmg;
      }
    }

    // Inimigos sangrando recebem mais dano se passivas de Sangramento estiverem ativas
    if (ent.bleedTimer > 0 && bonuses.tagMultipliers?.Sangramento > 1) {
      finalDamage *= bonuses.tagMultipliers.Sangramento;
    }

    ent.hp -= finalDamage;
    addFloatingText(
      ent.x + (Math.random() - 0.5) * 16,
      ent.y - 16,
      `${isCrit ? '⚡CRIT ' : ''}-${Math.round(finalDamage)}`,
      isCrit ? '#facc15' : (skill?.color || '#00e5ff'),
      13,
      isCrit
    );

    // Roubo de Vida (Life Leech) de passivas ou Frenesi do Megalodonte
    const totalLeech = (bonuses.lifeLeechPct || 0) + (shark.megalodonBuffTimer > 0 ? 0.35 : 0);
    if (totalLeech > 0) {
      const healed = finalDamage * totalLeech;
      shark.hp = Math.min(shark.maxHp, shark.hp + healed);
    }

    // Aplicação de Sangramento ([Sangramento] / Bote Voraz)
    const bleedChance = (skill?.bleedBaseChance || 0) + (bonuses.bleedChance || 0);
    if (bleedChance > 0 && Math.random() < bleedChance) {
      ent.bleedTimer = 4.0;
      ent.bleedDps = finalDamage * 0.28 * (1 + (bonuses.bleedDamagePct || 0));
      addFloatingText(ent.x, ent.y - 30, '🩸 SANGRAMENTO!', '#f43f5e', 11);
    }

    // Aplicação de Veneno de Passivas
    if (bonuses.poisonOnHit > 0) {
      ent.poisonTimer = 3.5;
      ent.poisonDps = finalDamage * bonuses.poisonOnHit;
    }

    if (ent.hp <= 0) {
      handleEntityDefeated(ent);
    }
  }, [addFloatingText, computeSkillSynergyMultiplier, handleEntityDefeated]);

  // Dispara uma das 2 Habilidades Habilitadas (Slot 1 ou Slot 2)
  const executeEquippedSkill = useCallback((slotIndex, targetX, targetY) => {
    const w = worldRef.current;
    const shark = w.shark;
    const { profile: prof, passiveBonuses: bonuses, expeditionState: expState } = propsRef.current;
    if (expState !== 'em_andamento') return false;
    if (shark.stunTimer > 0) {
      addFloatingText(shark.x, shark.y - 25, '⚡ ATORDOADO!', '#facc15', 13);
      return false;
    }

    const equippedIds = prof?.habilidadesEquipadas || ['snap_strike', 'tail_sweep'];
    const skillId = equippedIds[slotIndex];
    const skill = SKILLS_CATALOG.find(s => s.id === skillId);
    if (!skill) return false;

    const cdKey = slotIndex === 0 ? 'slot1' : 'slot2';
    if (shark.cooldowns[cdKey] > 0) {
      addFloatingText(shark.x, shark.y - 24, `⏳ ${skill.shortName} (${shark.cooldowns[cdKey].toFixed(1)}s)`, '#94a3b8', 11);
      return false;
    }

    // Validação rigorosa de custo de Fôlego ou Cargas de Frenesi (Seção 4.1.2)
    const costMult = Math.max(0.4, 1 + (bonuses?.folegoCostMultiplier || 0));
    if (skill.resourceType === 'frenesi') {
      if (shark.frenzyCharges < skill.cost) {
        addFloatingText(shark.x, shark.y - 26, `⚠️ Requer ${skill.cost} Cargas de Frenesi!`, '#f43f5e', 12);
        return false;
      }
      shark.frenzyCharges -= skill.cost;
    } else {
      const effectiveCost = Math.round(skill.cost * costMult);
      if (shark.folego < effectiveCost) {
        addFloatingText(shark.x, shark.y - 26, `⚠️ Fôlego Insuficiente (${effectiveCost})!`, '#38bdf8', 12);
        return false;
      }
      shark.folego -= effectiveCost;
    }

    // Cooldown com Redução de Recarga das passivas
    const cdr = Math.min(0.65, Math.max(0, bonuses?.cooldownReduction || 0));
    shark.cooldowns[cdKey] = Number((skill.cooldown * (1 - cdr)).toFixed(2));

    const dx = targetX - shark.x;
    const dy = targetY - shark.y;
    const dist = Math.hypot(dx, dy) || 1;
    const aimAngle = Math.atan2(dy, dx);

    // Efeitos específicos das 5 Habilidades do Catálogo (Seção 4.2)
    if (skill.id === 'snap_strike') {
      // Bote Voraz: Avança como um raio até a posição do cursor e morde com alto dano perfurante
      const dashDist = Math.min(dist, skill.range || 240);
      shark.x = Math.max(30, Math.min(w.width - 30, shark.x + Math.cos(aimAngle) * dashDist));
      shark.y = Math.max(35, Math.min(w.height - 35, shark.y + Math.sin(aimAngle) * dashDist));
      shark.angle = aimAngle;
      shark.facingLeft = Math.cos(aimAngle) < 0;
      shark.biteAnimTimer = 0.32;

      w.shockwaves.push({
        id: Math.random(),
        x: shark.x,
        y: shark.y,
        radius: 12,
        maxRadius: 68,
        color: '#00e5ff',
        life: 0.25,
        maxLife: 0.25
      });

      w.entities.forEach((ent) => {
        if (Math.hypot(ent.x - shark.x, ent.y - shark.y) <= ent.radius + 58) {
          dealSharkDamageToEntity(ent, skill.baseDamage, skill, aimAngle);
        }
      });
      w.entities = w.entities.filter(e => e.hp > 0);
    } else if (skill.id === 'tail_sweep') {
      // Vórtice de Cauda: Giro de 360° que destrói projéteis inimigos, repele águas-vivas e causa atordoamento
      shark.tailSweepAnimTimer = 0.45;
      const areaMult = 1 + (bonuses?.areaRadiusPct || 0);
      const sweepRadius = (skill.radius || 125) * areaMult;

      // Destrói projéteis inimigos dentro do raio
      const beforeProj = w.projectiles.length;
      w.projectiles = w.projectiles.filter(
        p => p.fromShark || Math.hypot(p.x - shark.x, p.y - shark.y) > sweepRadius
      );
      const destroyedCount = beforeProj - w.projectiles.length;
      if (destroyedCount > 0) {
        addFloatingText(shark.x, shark.y - 34, `🌀 ${destroyedCount} Projéteis Destruídos!`, '#b03af0', 12);
      }

      w.shockwaves.push({
        id: Math.random(),
        x: shark.x,
        y: shark.y,
        radius: 18,
        maxRadius: sweepRadius,
        color: '#b03af0',
        life: 0.4,
        maxLife: 0.4
      });

      w.entities.forEach((ent) => {
        const d = Math.hypot(ent.x - shark.x, ent.y - shark.y);
        if (d <= sweepRadius + ent.radius) {
          dealSharkDamageToEntity(ent, skill.baseDamage, skill, aimAngle);
          if (!ent.isPrey && ent.hp > 0) {
            ent.stunTimer = Math.max(ent.stunTimer, skill.stunDuration || 1.5);
            const pushAngle = Math.atan2(ent.y - shark.y, ent.x - shark.x);
            ent.x = Math.max(25, Math.min(w.width - 25, ent.x + Math.cos(pushAngle) * 75));
            ent.y = Math.max(30, Math.min(w.height - 30, ent.y + Math.sin(pushAngle) * 75));
          }
        }
      });
      w.entities = w.entities.filter(e => e.hp > 0);
    } else if (skill.id === 'denticle_salvo') {
      // Salva de Dentículos: Rajada cônica de 5 dentes cortantes (ou 360° com Keystone Dispersão da Hidra)
      const isHydra = Boolean(bonuses?.keystone_dispersao_hidra);
      const count = (skill.projectileCount || 5) + (bonuses?.extraProjectiles || 0);
      const projSpeed = (skill.projectileSpeed || 460) * (1 + (bonuses?.projectileSpeedPct || 0));
      const indivPenalty = isHydra ? 0.80 : 1.0;

      for (let i = 0; i < count; i++) {
        let ang = aimAngle;
        if (isHydra) {
          ang = (i * Math.PI * 2) / count;
        } else {
          const spread = skill.spreadAngle || 0.62;
          const step = count > 1 ? i / (count - 1) - 0.5 : 0;
          ang = aimAngle + step * spread;
        }

        w.projectiles.push({
          id: Math.random(),
          fromShark: true,
          skillRef: skill,
          x: shark.x + Math.cos(ang) * 24,
          y: shark.y + Math.sin(ang) * 24,
          vx: Math.cos(ang) * projSpeed,
          vy: Math.sin(ang) * projSpeed,
          radius: 6,
          damage: skill.baseDamage * indivPenalty,
          pierceLeft: bonuses?.projectilePierce || 0,
          ricochetLeft: bonuses?.projectileRicochet || 0,
          color: '#fa6400',
          life: 1.9
        });
      }
      shark.facingLeft = Math.cos(aimAngle) < 0;
    } else if (skill.id === 'megalodon_frenzy') {
      // Frenesi do Megalodonte: Ruge, dobra de escala, +100% dano e 35% roubo de vida por 6s
      const durMult = 1 + (bonuses?.buffDurationPct || 0);
      shark.megalodonBuffTimer = (skill.duration || 6.0) * durMult;
      addFloatingText(shark.x, shark.y - 35, '🩸 FRENESI DO MEGALODONTE! (+100% DANO / 35% LEECH)', '#f43f5e', 14, true);

      w.shockwaves.push({
        id: Math.random(),
        x: shark.x,
        y: shark.y,
        radius: 20,
        maxRadius: 175,
        color: '#f43f5e',
        life: 0.5,
        maxLife: 0.5
      });

      w.entities.forEach((ent) => {
        if (Math.hypot(ent.x - shark.x, ent.y - shark.y) <= 175) {
          dealSharkDamageToEntity(ent, skill.baseDamage, skill, aimAngle);
        }
      });
      w.entities = w.entities.filter(e => e.hp > 0);
    } else if (skill.id === 'evasive_propulsion') {
      // Propulsão Evasiva: Impulso rápido com imunidade total a dano e colisão por 0.35s (i-frame)
      const dashDist = skill.dashDistance || 210;
      shark.x = Math.max(30, Math.min(w.width - 30, shark.x + Math.cos(aimAngle) * dashDist));
      shark.y = Math.max(35, Math.min(w.height - 35, shark.y + Math.sin(aimAngle) * dashDist));
      shark.iframeTimer = (skill.iframeDuration || 0.35) + (bonuses?.extraIframe || 0);
      shark.stunTimer = 0; // Limpa atordoamento ao evadir
      shark.facingLeft = Math.cos(aimAngle) < 0;
      addFloatingText(shark.x, shark.y - 26, `🛡️ I-FRAME (${shark.iframeTimer.toFixed(2)}s)!`, '#10b981', 13, true);
    }

    return true;
  }, [addFloatingText, dealSharkDamageToEntity]);

  // Máquina de Estados de Obediência ao Clique (Seção 4.3):
  // Interrompe imediatamente a rota autônoma e desloca vetorialmente até (targetX, targetY)
  const issueManualClickCommand = useCallback((clickX, clickY, slotIndex = 0) => {
    const w = worldRef.current;
    const shark = w.shark;
    const { expeditionState: expState, profile: prof } = propsRef.current;
    if (expState !== 'em_andamento') return;

    const clampedX = Math.max(28, Math.min(w.width - 28, clickX));
    const clampedY = Math.max(32, Math.min(w.height - 32, clickY));

    // Regra 1 & 4 (Seção 4.3): Interrupção Imediata da Patrulha Automática + Substituição em Tempo Real (Re-targeting)
    shark.state = 'COMANDO_MANUAL';
    shark.subState = 'DeslocamentoVetorial';
    shark.targetX = clampedX;
    shark.targetY = clampedY;
    shark.pendingSlotIndex = slotIndex;

    const equippedIds = prof?.habilidadesEquipadas || ['snap_strike', 'tail_sweep'];
    const skillId = equippedIds[slotIndex];

    // Se a habilidade for de disparo imediato à distância (Salva de Dentículos, Frenesi ou Vórtice),
    // dispara enquanto o tubarão obedece ao vetor até o ponto clicado!
    if (skillId === 'denticle_salvo' || skillId === 'megalodon_frenzy' || skillId === 'evasive_propulsion') {
      executeEquippedSkill(slotIndex, clampedX, clampedY);
    }

    setNavStateBadge({
      mode: 'COMANDO_MANUAL',
      subState: 'DeslocamentoVetorial',
      targetX: Math.round(clampedX),
      targetY: Math.round(clampedY)
    });
  }, [executeEquippedSkill]);

  // Handlers de Mouse e Teclado ([Q], [W], [Espaço], Cliques Esquerdo e Direito)
  const handleCanvasMouseDown = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    worldRef.current.mouseX = x;
    worldRef.current.mouseY = y;

    if (e.button === 2) {
      // Clique Direito -> Slot 2
      issueManualClickCommand(x, y, 1);
    } else {
      // Clique Esquerdo -> Slot 1
      issueManualClickCommand(x, y, 0);
    }
  };

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    worldRef.current.mouseX = (e.clientX - rect.left) * scaleX;
    worldRef.current.mouseY = (e.clientY - rect.top) * scaleY;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      const key = e.key.toLowerCase();
      const w = worldRef.current;

      if (key === 'q') {
        e.preventDefault();
        issueManualClickCommand(w.mouseX, w.mouseY, 0);
        executeEquippedSkill(0, w.mouseX, w.mouseY);
      } else if (key === 'w') {
        e.preventDefault();
        issueManualClickCommand(w.mouseX, w.mouseY, 1);
        executeEquippedSkill(1, w.mouseX, w.mouseY);
      } else if (e.code === 'Space') {
        e.preventDefault();
        executeEquippedSkill(1, w.mouseX, w.mouseY);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executeEquippedSkill, issueManualClickCommand]);

  // Reinicia o mundo quando a expedição transita para 'em_andamento'
  const prevExpStateRef = useRef(expeditionState);
  useEffect(() => {
    if (expeditionState === 'em_andamento' && prevExpStateRef.current !== 'em_andamento') {
      resetWorldForExpedition();
    }
    prevExpStateRef.current = expeditionState;
  }, [expeditionState, resetWorldForExpedition]);

  // Inicializa o mundo na montagem
  useEffect(() => {
    resetWorldForExpedition();
  }, [resetWorldForExpedition]);

  // Loop Principal de Física e Renderização Canvas 2D (60 FPS)
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();
    let uiSyncAccumulator = 0;
    let spawnAccumulator = 0;

    const stepPhysics = (dt) => {
      const w = worldRef.current;
      const shark = w.shark;
      const {
        passiveBonuses: bonuses = {},
        mapTelemetry: tele = { maxEntities: 14, tier: 1, difficulty: 10, activeAffixes: [] },
        expeditionState: expState
      } = propsRef.current;

      if (expState !== 'em_andamento') return;

      w.elapsedSeconds += dt;
      spawnAccumulator += dt;

      // Atualiza máximos dinâmicos da árvore de passivas
      const targetMaxHp = Math.round(180 * (1 + (bonuses.maxHpPct || 0)));
      const targetMaxFolego = Math.round(100 * (1 + (bonuses.maxFolegoPct || 0)));
      const targetMaxFrenzy = Math.min(5, Math.max(3, bonuses.maxFrenzyCharges || 3));
      shark.maxHp = targetMaxHp;
      shark.maxFolego = targetMaxFolego;
      shark.maxFrenzyCharges = targetMaxFrenzy;

      // Cooldowns das 2 habilidades
      shark.cooldowns.slot1 = Math.max(0, shark.cooldowns.slot1 - dt);
      shark.cooldowns.slot2 = Math.max(0, shark.cooldowns.slot2 - dt);
      shark.biteAnimTimer = Math.max(0, shark.biteAnimTimer - dt);
      shark.tailSweepAnimTimer = Math.max(0, shark.tailSweepAnimTimer - dt);
      shark.iframeTimer = Math.max(0, shark.iframeTimer - dt);
      shark.stunTimer = Math.max(0, shark.stunTimer - dt);
      shark.megalodonBuffTimer = Math.max(0, shark.megalodonBuffTimer - dt);

      // Regeneração passiva de Fôlego (a menos que desativada pela Keystone Banquete de Sangue)
      if (!bonuses.disablePassiveFolegoRegen) {
        const folegoRegenRate = 11.5 * (1 + (bonuses.folegoRegenPct || 0));
        shark.folego = Math.min(shark.maxFolego, shark.folego + folegoRegenRate * dt);
      }

      // Regeneração de Vida das passivas
      if (bonuses.hpRegenFlat > 0) {
        shark.hp = Math.min(shark.maxHp, shark.hp + bonuses.hpRegenFlat * dt);
      }

      // Efeitos ambientais e DoTs no Tubarão (Maré Ácida, Veneno, Sangramento)
      const hazardRes = Math.min(0.75, bonuses.hazardResistance || 0);
      if ((tele.activeAffixes || []).includes('mare_acida') && shark.iframeTimer <= 0) {
        const acidDmg = shark.maxHp * 0.016 * (1 - hazardRes) * dt;
        shark.hp -= acidDmg;
        w.damageTakenBySource['Dano Contínuo de Maré Ácida'] =
          (w.damageTakenBySource['Dano Contínuo de Maré Ácida'] || 0) + acidDmg;
      }

      if (shark.poisonTimer > 0) {
        shark.poisonTimer = Math.max(0, shark.poisonTimer - dt);
        if (shark.iframeTimer <= 0) {
          const pDmg = shark.poisonDps * (1 - hazardRes) * dt;
          shark.hp -= pDmg;
          w.damageTakenBySource['Veneno Cáustico de Água-viva'] =
            (w.damageTakenBySource['Veneno Cáustico de Água-viva'] || 0) + pDmg;
        }
      }

      if (shark.bleedTimer > 0) {
        shark.bleedTimer = Math.max(0, shark.bleedTimer - dt);
        if (shark.iframeTimer <= 0) {
          const bDmg = shark.bleedDps * (1 - (bonuses.armorPct || 0)) * dt;
          shark.hp -= bDmg;
          w.damageTakenBySource['Sangramento de Peixe-Pescador Abissal'] =
            (w.damageTakenBySource['Sangramento de Peixe-Pescador Abissal'] || 0) + bDmg;
        }
      }

      // Verifica Aura Criogênica (35% desaceleração - Seção 3.3)
      shark.cryoSlowed = w.entities.some(
        e => !e.isPrey && e.rareAffix?.id === 'criogenico' &&
          Math.hypot(e.x - shark.x, e.y - shark.y) <= (e.rareAffix.auraRadius || 120)
      );

      // ======================================================================
      // Movimentação do Tubarão Alfa: Máquina de Estados Estrita (Seção 4.3)
      // ======================================================================
      const baseSpeed = 195 * (1 + (bonuses.moveSpeedPct || 0)) * (shark.cryoSlowed ? 0.65 : 1.0);

      if (shark.stunTimer <= 0) {
        if (shark.state === 'COMANDO_MANUAL' && shark.targetX !== null && shark.targetY !== null) {
          const dx = shark.targetX - shark.x;
          const dy = shark.targetY - shark.y;
          const dist = Math.hypot(dx, dy);

          // Tolerância radial estrita dist <= 15px (Seção 4.3)
          if (dist <= 15) {
            shark.x = shark.targetX;
            shark.y = shark.targetY;
            shark.subState = 'ExecucaoAcao';

            // Executa a habilidade / mordida agendada no destino
            const slotIdx = shark.pendingSlotIndex ?? 0;
            executeEquippedSkill(slotIdx, shark.targetX, shark.targetY);

            // Mordida direta ao chegar no ponto clicado
            shark.biteAnimTimer = Math.max(shark.biteAnimTimer, 0.25);
            w.entities.forEach((ent) => {
              if (Math.hypot(ent.x - shark.x, ent.y - shark.y) <= ent.radius + 46) {
                const primarySkill = SKILLS_CATALOG.find(
                  s => s.id === (propsRef.current.profile?.habilidadesEquipadas?.[slotIdx] || 'snap_strike')
                ) || SKILLS_CATALOG[0];
                dealSharkDamageToEntity(ent, primarySkill.baseDamage * 0.85, primarySkill, shark.angle);
              }
            });
            w.entities = w.entities.filter(e => e.hp > 0);

            // Somente APÓS AcaoConcluida retorna para Patrulha Automática (Regra 3 da Seção 4.3)
            shark.subState = 'AcaoConcluida';
            shark.state = 'PATRULHA_AUTOMATICA';
            shark.targetX = null;
            shark.targetY = null;
            shark.pendingSlotIndex = null;
            setNavStateBadge({
              mode: 'PATRULHA_AUTOMATICA',
              subState: 'AcaoConcluida -> Patrulha',
              targetX: null,
              targetY: null
            });
          } else {
            // DeslocamentoVetorial ininterrupto em linha reta com aceleração máxima
            const manualSpeed = baseSpeed * 1.48;
            const moveStep = Math.min(dist, manualSpeed * dt);
            const ang = Math.atan2(dy, dx);
            shark.vx = Math.cos(ang) * manualSpeed;
            shark.vy = Math.sin(ang) * manualSpeed;
            shark.x += Math.cos(ang) * moveStep;
            shark.y += Math.sin(ang) * moveStep;
            shark.angle = ang;
            shark.facingLeft = Math.cos(ang) < 0;
          }
        } else {
          // Estado: PATRULHA_AUTOMATICA
          // Se o Notável 'Piloto Automático Predador' estiver alocado, busca a presa/inimigo mais próximo
          let wpX = shark.patrolWaypointX;
          let wpY = shark.patrolWaypointY;

          if (bonuses.smartPatrol && w.entities.length > 0) {
            const nearest = w.entities.reduce((best, curr) => {
              const d = Math.hypot(curr.x - shark.x, curr.y - shark.y);
              return !best || d < best.d ? { ent: curr, d } : best;
            }, null);
            if (nearest) {
              wpX = nearest.ent.x;
              wpY = nearest.ent.y;
            }
          }

          const dx = wpX - shark.x;
          const dy = wpY - shark.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 28) {
            shark.patrolWaypointX = 65 + Math.random() * (w.width - 130);
            shark.patrolWaypointY = 65 + Math.random() * (w.height - 140);
          } else {
            const ang = Math.atan2(dy, dx);
            shark.vx = Math.cos(ang) * baseSpeed * 0.82;
            shark.vy = Math.sin(ang) * baseSpeed * 0.82;
            shark.x += shark.vx * dt;
            shark.y += shark.vy * dt;
            shark.angle = ang;
            shark.facingLeft = Math.cos(ang) < 0;
          }

          // Keystone Predador Autônomo: dispara habilidade em patrulha
          if (bonuses.autoCastInPatrol) {
            shark.autoCastTimer += dt;
            if (shark.autoCastTimer >= 2.5 && w.entities.length > 0) {
              shark.autoCastTimer = 0;
              const target = w.entities[0];
              executeEquippedSkill(0, target.x, target.y);
            }
          }
        }
      }

      // Mantém o Tubarão dentro dos limites do oceano
      shark.x = Math.max(28, Math.min(w.width - 28, shark.x));
      shark.y = Math.max(32, Math.min(w.height - 32, shark.y));

      // ======================================================================
      // Atualização das Entidades Marinhas (Presas e Inimigos do Mar)
      // ======================================================================
      if (spawnAccumulator >= 1.15) {
        spawnAccumulator = 0;
        if (w.entities.length < (tele.maxEntities || 14)) {
          spawnMarineEntity();
        }
      }

      for (let i = w.entities.length - 1; i >= 0; i--) {
        const ent = w.entities[i];
        ent.phaseOffset += dt * 3.2;

        // DoTs nos inimigos (Sangramento e Veneno aplicados pelo Tubarão)
        if (ent.bleedTimer > 0) {
          ent.bleedTimer = Math.max(0, ent.bleedTimer - dt);
          ent.hp -= ent.bleedDps * dt;
        }
        if (ent.poisonTimer > 0) {
          ent.poisonTimer = Math.max(0, ent.poisonTimer - dt);
          ent.hp -= ent.poisonDps * dt;
        }
        if (ent.hp <= 0) {
          handleEntityDefeated(ent);
          w.entities.splice(i, 1);
          continue;
        }

        if (ent.stunTimer > 0) {
          ent.stunTimer = Math.max(0, ent.stunTimer - dt);
          continue;
        }

        const dxToShark = shark.x - ent.x;
        const dyToShark = shark.y - ent.y;
        const distToShark = Math.hypot(dxToShark, dyToShark) || 1;

        if (ent.isPrey) {
          // Presa Comum: Fuga em cardume quando o tubarão se aproxima, ou atraída pela Sucção Eletrossensorial
          const suctionRad = bonuses.suctionRadius || 42;
          if (distToShark <= suctionRad) {
            ent.x += (dxToShark / distToShark) * 145 * dt;
            ent.y += (dyToShark / distToShark) * 145 * dt;
          } else if (distToShark < 130) {
            ent.vx = -(dxToShark / distToShark) * ent.speed * 1.15;
            ent.vy = -(dyToShark / distToShark) * ent.speed * 0.85;
            ent.x += ent.vx * dt;
            ent.y += ent.vy * dt;
          } else {
            ent.x += ent.vx * dt;
            ent.y += Math.sin(ent.phaseOffset) * 18 * dt;
          }

          // Consumo de presa ao encostar na mandíbula do tubarão
          const biteReach = bonuses.instinctiveBite ? 48 : 34;
          if (distToShark <= biteReach) {
            shark.biteAnimTimer = 0.22;
            handleEntityDefeated(ent);
            w.entities.splice(i, 1);
            continue;
          }
        } else {
          // Comportamento específico por classe de Inimigo do Mar (Seção 3.2)
          ent.attackCooldown = Math.max(0, ent.attackCooldown - dt);

          if (ent.type === 'agua_viva_toxica') {
            // Flutuação vertical oscilante + dano contínuo de veneno por segundo ao tocar
            ent.x += ent.vx * 0.45 * dt;
            ent.y = ent.baseY + Math.sin(ent.phaseOffset * 0.8) * 52;
            if (distToShark <= ent.radius + 26 && shark.iframeTimer <= 0) {
              const contactDmg = ent.damage * (1 - hazardRes) * dt;
              shark.hp -= contactDmg;
              shark.poisonTimer = 2.5;
              shark.poisonDps = ent.damage * 0.45;
              w.damageTakenBySource[ent.damageType] = (w.damageTakenBySource[ent.damageType] || 0) + contactDmg;
              if (ent.rareAffix?.id === 'vampirico') {
                ent.hp = Math.min(ent.maxHp, ent.hp + contactDmg * 2.5);
              }
            }
          } else if (ent.type === 'enguia_eletrica') {
            // Nado sinuoso em alta velocidade + projétil elétrico linear que atordoa por 1s
            ent.x += ent.vx * dt;
            ent.y += Math.cos(ent.phaseOffset * 1.6) * 65 * dt;
            if (ent.attackCooldown <= 0 && distToShark < 340) {
              ent.attackCooldown = 2.8;
              const aim = Math.atan2(dyToShark, dxToShark);
              w.projectiles.push({
                id: Math.random(),
                fromShark: false,
                ownerId: ent.id,
                isVampiric: ent.rareAffix?.id === 'vampirico',
                x: ent.x,
                y: ent.y,
                vx: Math.cos(aim) * 290,
                vy: Math.sin(aim) * 290,
                radius: 6,
                damage: ent.damage,
                damageType: ent.damageType,
                stunDuration: 1.0, // Atordoa o tubarão por 1 segundo!
                color: '#facc15',
                life: 2.2
              });
            }
          } else if (ent.type === 'caranguejo_couracado') {
            // Rasteja pelo leito oceânico + carapaça frontal 75% + espinhos
            ent.y = w.height - 44;
            ent.x += ent.vx * dt;
            if (distToShark <= ent.radius + 28 && ent.attackCooldown <= 0 && shark.iframeTimer <= 0) {
              ent.attackCooldown = 1.4;
              const pinchDmg = ent.damage * (1 - (bonuses.armorPct || 0));
              shark.hp -= pinchDmg;
              w.damageTakenBySource[ent.damageType] = (w.damageTakenBySource[ent.damageType] || 0) + pinchDmg;
              addFloatingText(shark.x, shark.y - 20, `🦀 -${Math.round(pinchDmg)}`, '#f97316', 12);
            }
          } else if (ent.type === 'peixe_pescador_abissal') {
            // Camuflado nas sombras; avanço repentino + 40% chance de Sangramento
            if (distToShark < 210) {
              ent.vx = (dxToShark / distToShark) * ent.speed * 1.35;
              ent.vy = (dyToShark / distToShark) * ent.speed * 1.35;
            }
            ent.x += ent.vx * dt;
            ent.y += ent.vy * dt;

            if (distToShark <= ent.radius + 26 && ent.attackCooldown <= 0 && shark.iframeTimer <= 0) {
              ent.attackCooldown = 1.65;
              const biteDmg = ent.damage * (1 - (bonuses.armorPct || 0));
              shark.hp -= biteDmg;
              w.damageTakenBySource[ent.damageType] = (w.damageTakenBySource[ent.damageType] || 0) + biteDmg;
              if (ent.rareAffix?.id === 'vampirico') {
                ent.hp = Math.min(ent.maxHp, ent.hp + biteDmg * 1.5);
              }
              // 40% de chance de causar Sangramento (Seção 3.2)
              if (Math.random() < 0.40) {
                shark.bleedTimer = 3.5;
                shark.bleedDps = ent.damage * 0.32;
                addFloatingText(shark.x, shark.y - 28, '🩸 SANGRAMENTO ABISSAL!', '#ef4444', 12, true);
              }
            }
          } else if (ent.type === 'leviata_abissal') {
            // Leviatã Abissal (Chefe): Invoca tentáculos e vórtices + ataques em área telegrafados
            ent.x += (dxToShark / distToShark) * ent.speed * 0.65 * dt;
            ent.y += (dyToShark / distToShark) * ent.speed * 0.65 * dt;
            if (ent.attackCooldown <= 0) {
              ent.attackCooldown = 3.2;
              w.shockwaves.push({
                id: Math.random(),
                isEnemyTelegraph: true,
                x: shark.x,
                y: shark.y,
                radius: 15,
                maxRadius: 92,
                damage: ent.damage * 1.35,
                damageType: ent.damageType,
                color: '#ec4899',
                life: 0.85,
                maxLife: 0.85
              });
            }
          }

          // Mordida Instintiva ou colisão de ataque do Tubarão contra inimigos próximos
          if (bonuses.instinctiveBite && distToShark <= ent.radius + 32 && shark.biteAnimTimer <= 0) {
            shark.biteAnimTimer = 0.35;
            const eqSkill = SKILLS_CATALOG.find(
              s => s.id === (propsRef.current.profile?.habilidadesEquipadas?.[0] || 'snap_strike')
            ) || SKILLS_CATALOG[0];
            dealSharkDamageToEntity(ent, eqSkill.baseDamage * 0.55, eqSkill, shark.angle);
          }
        }

        // Rebate nas bordas do oceano
        if (ent.x < 24) {
          ent.x = 24;
          ent.vx = Math.abs(ent.vx);
        } else if (ent.x > w.width - 24) {
          ent.x = w.width - 24;
          ent.vx = -Math.abs(ent.vx);
        }
        if (ent.y < 36) {
          ent.y = 36;
          ent.vy = Math.abs(ent.vy);
        } else if (ent.y > w.height - 36) {
          ent.y = w.height - 36;
          ent.vy = -Math.abs(ent.vy);
        }
      }

      // ======================================================================
      // Atualização de Projéteis (Dentículos do Tubarão vs Raios/Espinhos Inimigos)
      // ======================================================================
      for (let i = w.projectiles.length - 1; i >= 0; i--) {
        const p = w.projectiles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;

        // Ricochete nas paredes para projéteis do tubarão se o Notável 'Ricochete Coralino' estiver ativo
        if (p.fromShark && p.ricochetLeft > 0) {
          if (p.x <= 12 || p.x >= w.width - 12) {
            p.vx *= -1;
            p.ricochetLeft -= 1;
          }
          if (p.y <= 12 || p.y >= w.height - 12) {
            p.vy *= -1;
            p.ricochetLeft -= 1;
          }
        }

        if (p.life <= 0 || p.x < -20 || p.x > w.width + 20 || p.y < -20 || p.y > w.height + 20) {
          w.projectiles.splice(i, 1);
          continue;
        }

        if (p.fromShark) {
          for (let j = w.entities.length - 1; j >= 0; j--) {
            const ent = w.entities[j];
            if (Math.hypot(ent.x - p.x, ent.y - p.y) <= ent.radius + p.radius + 4) {
              dealSharkDamageToEntity(ent, p.damage, p.skillRef, Math.atan2(p.vy, p.vx));
              if (ent.hp <= 0) {
                w.entities.splice(j, 1);
              }
              if (p.pierceLeft > 0) {
                p.pierceLeft -= 1;
              } else {
                w.projectiles.splice(i, 1);
              }
              break;
            }
          }
        } else {
          // Projétil inimigo contra o Tubarão Alfa
          if (Math.hypot(shark.x - p.x, shark.y - p.y) <= 26 + p.radius) {
            if (shark.iframeTimer > 0) {
              addFloatingText(shark.x, shark.y - 20, '🛡️ EVADIDO (I-FRAME)', '#10b981', 11);
            } else {
              const dmg = p.damage * (1 - hazardRes) * (1 - (bonuses.armorPct || 0));
              shark.hp -= dmg;
              w.damageTakenBySource[p.damageType || 'Projétil Abissal'] =
                (w.damageTakenBySource[p.damageType || 'Projétil Abissal'] || 0) + dmg;

              // Atordoamento de 1s da Enguia Elétrica (Seção 3.2)
              if (p.stunDuration > 0 && !bonuses.stunImmunity) {
                const effStun = p.stunDuration * (1 - Math.min(0.85, bonuses.stunReduction || 0));
                if (effStun > 0.05) {
                  shark.stunTimer = Math.max(shark.stunTimer, effStun);
                  addFloatingText(shark.x, shark.y - 28, `⚡ ATORDOADO (${effStun.toFixed(1)}s)!`, '#facc15', 13, true);
                }
              }

              // Se o inimigo dono for Vampírico, recupera vida
              if (p.isVampiric && p.ownerId) {
                const owner = w.entities.find(e => e.id === p.ownerId);
                if (owner) {
                  owner.hp = Math.min(owner.maxHp, owner.hp + dmg * 1.8);
                }
              }
            }
            w.projectiles.splice(i, 1);
          }
        }
      }

      // ======================================================================
      // Atualização de Ondas de Choque e Áreas Telegrafadas do Leviatã
      // ======================================================================
      for (let i = w.shockwaves.length - 1; i >= 0; i--) {
        const sw = w.shockwaves[i];
        sw.life -= dt;
        const progress = 1 - Math.max(0, sw.life / sw.maxLife);
        sw.radius = 14 + (sw.maxRadius - 14) * progress;

        if (sw.life <= 0) {
          if (sw.isEnemyTelegraph && shark.iframeTimer <= 0) {
            const d = Math.hypot(shark.x - sw.x, shark.y - sw.y);
            if (d <= sw.maxRadius) {
              const dmg = sw.damage * (1 - (bonuses.armorPct || 0));
              shark.hp -= dmg;
              w.damageTakenBySource[sw.damageType] = (w.damageTakenBySource[sw.damageType] || 0) + dmg;
              addFloatingText(shark.x, shark.y - 28, `💥 ONDA DO LEVIATÃ -${Math.round(dmg)}`, '#ec4899', 14, true);
            }
          }
          w.shockwaves.splice(i, 1);
        }
      }

      // ======================================================================
      // Coleta & Sucção Eletrossensorial de Orbes de Biomassa / XP
      // ======================================================================
      const suctionRadius = bonuses.suctionRadius || 48;
      for (let i = w.biomassOrbs.length - 1; i >= 0; i--) {
        const orb = w.biomassOrbs[i];
        orb.life -= dt;
        const dx = shark.x - orb.x;
        const dy = shark.y - orb.y;
        const d = Math.hypot(dx, dy) || 1;

        if (d <= suctionRadius + 30) {
          orb.x += (dx / d) * 260 * dt;
          orb.y += (dy / d) * 260 * dt;
        }

        if (d <= 28 || orb.life <= 0) {
          w.runXpGained += orb.xpAmount;
          w.runBiomassGained += orb.amount;
          w.unsyncedXp += orb.xpAmount;
          w.unsyncedBiomass += orb.amount;
          w.biomassOrbs.splice(i, 1);
        }
      }

      // Textos flutuantes no Canvas
      for (let i = w.floatingTexts.length - 1; i >= 0; i--) {
        const ft = w.floatingTexts[i];
        ft.y += ft.vy * dt;
        ft.life -= dt;
        ft.alpha = Math.max(0, ft.life);
        if (ft.life <= 0) w.floatingTexts.splice(i, 1);
      }

      // Bolhas de fundo
      w.bubbles.forEach((b) => {
        b.y -= b.speed * dt;
        if (b.y < -10) {
          b.y = w.height + 10;
          b.x = Math.random() * w.width;
        }
      });

      // ======================================================================
      // Verificação de Morte do Tubarão (HP <= 0 -> Pausa Total & Relatório Analítico)
      // ======================================================================
      if (shark.hp <= 0) {
        shark.hp = 0;
        const entries = Object.entries(w.damageTakenBySource);
        const totalDmgTaken = entries.reduce((acc, [, v]) => acc + v, 0) || 1;
        const sortedCauses = entries
          .sort((a, b) => b[1] - a[1])
          .map(([source, val]) => `${Math.round((val / totalDmgTaken) * 100)}% ${source}`);

        const analyticCause =
          sortedCauses.length > 0
            ? sortedCauses.slice(0, 3).join(', ')
            : '100% Colapso sob Pressão Abissal';

        if (propsRef.current.onExpeditionDeath) {
          propsRef.current.onExpeditionDeath({
            tier: tele.tier || 1,
            dificuldade: tele.difficulty || 10,
            inimigosAbatidos: w.killsCount,
            presasDevoradas: w.preyDevouredCount,
            tempoSobrevivenciaSegundos: Number(w.elapsedSeconds.toFixed(1)),
            xpTotalGanho: Number(w.runXpGained.toFixed(1)),
            biomassaGanha: Number(w.runBiomassGained.toFixed(1)),
            causaMorte: analyticCause,
            unsyncedXp: w.unsyncedXp,
            unsyncedBiomass: w.unsyncedBiomass
          });
          w.unsyncedXp = 0;
          w.unsyncedBiomass = 0;
        }
        return;
      }

      // Sincroniza telemetria em tempo real com a Coluna Central e Backend a cada 0.25s
      uiSyncAccumulator += dt;
      if (uiSyncAccumulator >= 0.25) {
        uiSyncAccumulator = 0;
        setSkillCooldownsUi({
          slot1: Number(shark.cooldowns.slot1.toFixed(1)),
          slot2: Number(shark.cooldowns.slot2.toFixed(1))
        });

        if (propsRef.current.onLiveTelemetryUpdate) {
          const minutes = Math.max(0.05, w.elapsedSeconds / 60);
          propsRef.current.onLiveTelemetryUpdate({
            hp: Math.round(shark.hp),
            maxHp: shark.maxHp,
            folego: Math.round(shark.folego),
            maxFolego: shark.maxFolego,
            frenzyCharges: shark.frenzyCharges,
            maxFrenzyCharges: shark.maxFrenzyCharges,
            activeEntitiesCount: w.entities.length,
            killsCount: w.killsCount,
            preyDevouredCount: w.preyDevouredCount,
            killsPerMinute: Number((w.killsCount / minutes).toFixed(1)),
            elapsedSeconds: Number(w.elapsedSeconds.toFixed(1)),
            runXpGained: Number(w.runXpGained.toFixed(1)),
            runBiomassGained: Number(w.runBiomassGained.toFixed(1)),
            sharkState: shark.state,
            sharkSubState: shark.subState,
            buffs: {
              megalodonFrenzy: Number(shark.megalodonBuffTimer.toFixed(1)),
              iframe: Number(shark.iframeTimer.toFixed(2)),
              stunned: Number(shark.stunTimer.toFixed(1)),
              bleeding: Number(shark.bleedTimer.toFixed(1)),
              poisoned: Number(shark.poisonTimer.toFixed(1)),
              cryoSlowed: shark.cryoSlowed
            }
          });
        }

        // Sincroniza XP/Biomassa acumulada no SQLite WAL a cada lote significativo
        if ((w.unsyncedXp >= 15 || w.unsyncedBiomass >= 12) && propsRef.current.onLiveProgressGain) {
          const xpToSync = w.unsyncedXp;
          const bioToSync = w.unsyncedBiomass;
          w.unsyncedXp = 0;
          w.unsyncedBiomass = 0;
          propsRef.current.onLiveProgressGain(xpToSync, bioToSync);
        }
      }
    };

    const drawCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = worldRef.current;
      const shark = w.shark;
      const { passiveBonuses: bonuses = {}, mapTelemetry: tele = {} } = propsRef.current;

      ctx.clearRect(0, 0, w.width, w.height);

      // 1. Fundo Oceânico Abissal Bioluminescente (Seção 2.2)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, w.height);
      bgGrad.addColorStop(0, '#031b33');
      bgGrad.addColorStop(0.55, '#020d1c');
      bgGrad.addColorStop(1, '#01050c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w.width, w.height);

      // Névoa de Maré Ácida se o afixo estiver ativo
      if ((tele.activeAffixes || []).includes('mare_acida')) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.06)';
        ctx.fillRect(0, 0, w.width, w.height);
      }

      // Feixes de luz abissal
      ctx.save();
      const rayGrad = ctx.createRadialGradient(w.width * 0.5, 0, 10, w.width * 0.5, 120, 420);
      rayGrad.addColorStop(0, 'rgba(0, 229, 255, 0.11)');
      rayGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = rayGrad;
      ctx.fillRect(0, 0, w.width, w.height);
      ctx.restore();

      // Bolhas subaquáticas
      ctx.fillStyle = 'rgba(125, 211, 252, 0.22)';
      w.bubbles.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Leito oceânico (fundo do mar)
      ctx.fillStyle = '#04101f';
      ctx.beginPath();
      ctx.moveTo(0, w.height);
      ctx.lineTo(0, w.height - 28);
      ctx.quadraticCurveTo(w.width * 0.25, w.height - 44, w.width * 0.5, w.height - 26);
      ctx.quadraticCurveTo(w.width * 0.75, w.height - 12, w.width, w.height - 32);
      ctx.lineTo(w.width, w.height);
      ctx.closePath();
      ctx.fill();

      // 2. Vetor de Obediência ao Clique (COMANDO_MANUAL - Seção 4.3)
      if (shark.state === 'COMANDO_MANUAL' && shark.targetX !== null && shark.targetY !== null) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.65)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(shark.x, shark.y);
        ctx.lineTo(shark.targetX, shark.targetY);
        ctx.stroke();

        // Retícula do destino exato (dist <= 15px)
        ctx.setLineDash([]);
        ctx.strokeStyle = '#00e5ff';
        ctx.beginPath();
        ctx.arc(shark.targetX, shark.targetY, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(shark.targetX, shark.targetY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#00e5ff';
        ctx.fill();
        ctx.restore();
      }

      // 3. Anel de Sucção Eletrossensorial (Quadrante Sudeste QoL)
      if ((bonuses.suctionRadius || 42) > 50) {
        ctx.save();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.22)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(shark.x, shark.y, bonuses.suctionRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 4. Ondas de Choque e Áreas Telegrafadas
      w.shockwaves.forEach((sw) => {
        ctx.save();
        const alpha = Math.max(0.15, sw.life / sw.maxLife);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = sw.isEnemyTelegraph ? 3 : 4;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        if (sw.isEnemyTelegraph) {
          ctx.fillStyle = 'rgba(236, 72, 153, 0.16)';
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.maxRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 5. Orbes de Biomassa
      w.biomassOrbs.forEach((orb) => {
        ctx.save();
        ctx.shadowColor = orb.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = orb.color;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 6. Entidades Marinhas (Presas Naturais e Inimigos do Mar com Barras de HP)
      w.entities.forEach((ent) => {
        ctx.save();

        // Aura Bioluminescente de Inimigo Raro (Archnemesis - Seção 3.3)
        if (ent.rareAffix) {
          ctx.save();
          ctx.strokeStyle = ent.rareAffix.auraColor;
          ctx.fillStyle = ent.rareAffix.auraColor + '18';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ent.x, ent.y, ent.rareAffix.auraRadius || 95, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        ctx.translate(ent.x, ent.y);
        const facingLeft = ent.vx < 0;

        if (ent.isPrey) {
          // Silhueta Vetorial de Presa Comum (Sardinha / Atum)
          ctx.scale(facingLeft ? -1 : 1, 1);
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(-10, 0);
          ctx.lineTo(-17, -6);
          ctx.lineTo(-17, 6);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(6, -1.5, 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (ent.type === 'agua_viva_toxica') {
          // Água-viva Tóxica
          ctx.fillStyle = '#d946ef';
          ctx.shadowColor = '#d946ef';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(0, -4, 16, Math.PI, 0, false);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#f0abfc';
          ctx.lineWidth = 2;
          for (let t = -10; t <= 10; t += 5) {
            ctx.beginPath();
            ctx.moveTo(t, -4);
            ctx.quadraticCurveTo(t + Math.sin(ent.phaseOffset + t) * 5, 8, t, 18);
            ctx.stroke();
          }
        } else if (ent.type === 'enguia_eletrica') {
          // Enguia Elétrica
          ctx.scale(facingLeft ? -1 : 1, 1);
          ctx.strokeStyle = '#facc15';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
          ctx.lineWidth = 7;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-22, Math.sin(ent.phaseOffset) * 5);
          ctx.quadraticCurveTo(-7, -Math.sin(ent.phaseOffset) * 7, 8, Math.sin(ent.phaseOffset) * 4);
          ctx.lineTo(22, 0);
          ctx.stroke();
        } else if (ent.type === 'caranguejo_couracado') {
          // Caranguejo Couraçado (com escudo frontal brilhante)
          ctx.scale(facingLeft ? -1 : 1, 1);
          ctx.fillStyle = '#f97316';
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.ellipse(0, 0, 20, 13, 0, 0, Math.PI * 2);
          ctx.fill();
          // Carapaça Frontal Blindada (-75% Dano)
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(6, 0, 16, -Math.PI * 0.45, Math.PI * 0.45);
          ctx.stroke();
        } else if (ent.type === 'peixe_pescador_abissal') {
          // Peixe-Pescador Abissal (camuflado nas sombras + lanterna bioluminescente)
          ctx.scale(facingLeft ? -1 : 1, 1);
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.ellipse(0, 2, 19, 13, 0, 0, Math.PI * 2);
          ctx.fill();
          // Antena / Lanterna bioluminescente
          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(6, -9);
          ctx.quadraticCurveTo(18, -22, 24, -10);
          ctx.stroke();
          ctx.fillStyle = '#00e5ff';
          ctx.beginPath();
          ctx.arc(24, -10, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (ent.type === 'leviata_abissal') {
          // Leviatã Abissal (Chefe)
          ctx.fillStyle = '#ec4899';
          ctx.shadowColor = '#ec4899';
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(0, 0, 34, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 4;
          for (let k = 0; k < 6; k++) {
            const a = (k * Math.PI * 2) / 6 + ent.phaseOffset * 0.3;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 24, Math.sin(a) * 24);
            ctx.lineTo(Math.cos(a + 0.3) * 48, Math.sin(a + 0.3) * 48);
            ctx.stroke();
          }
        }

        ctx.restore();

        // Barra de Vida e Tags de Status para Inimigos do Mar
        if (!ent.isPrey) {
          const barW = ent.isBoss ? 76 : 44;
          const barH = ent.isBoss ? 7 : 5;
          const bx = ent.x - barW / 2;
          const by = ent.y - ent.radius - 14;

          ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
          ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);

          const hpRatio = Math.max(0, Math.min(1, ent.hp / ent.maxHp));
          ctx.fillStyle = ent.rareAffix ? ent.rareAffix.auraColor : ent.color;
          ctx.fillRect(bx, by, barW * hpRatio, barH);

          if (ent.rareAffix || ent.isBoss) {
            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(
              ent.isBoss ? '👑 LEVIATÃ ABISSAL' : `★ ${ent.rareAffix.name.toUpperCase()}`,
              ent.x,
              by - 4
            );
          }
        }
      });

      // 7. Projéteis (Dentículos do Tubarão e Raios/Espinhos Inimigos)
      w.projectiles.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 8. Tubarão Alfa Predador (Controlado pelo Jogador)
      ctx.save();
      ctx.translate(shark.x, shark.y);
      const scaleMult = shark.megalodonBuffTimer > 0 ? 1.48 : 1.0;
      ctx.scale((shark.facingLeft ? -1 : 1) * scaleMult, scaleMult);

      // Escudo I-Frame (Propulsão Evasiva)
      if (shark.iframeTimer > 0) {
        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Aura de Frenesi do Megalodonte
      if (shark.megalodonBuffTimer > 0) {
        ctx.save();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 46, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Silhueta Bioluminescente Vetorial do Tubarão Alfa
      const sharkColor = shark.megalodonBuffTimer > 0 ? '#f43f5e' : '#00e5ff';
      ctx.fillStyle = sharkColor;
      ctx.shadowColor = sharkColor;
      ctx.shadowBlur = 16;

      // Corpo hidrodinâmico
      ctx.beginPath();
      ctx.moveTo(-28, 0);
      ctx.quadraticCurveTo(-5, -18, 34, -2);
      ctx.quadraticCurveTo(10, 16, -28, 4);
      ctx.closePath();
      ctx.fill();

      // Barbatana dorsal
      ctx.beginPath();
      ctx.moveTo(-4, -11);
      ctx.lineTo(6, -27);
      ctx.lineTo(14, -9);
      ctx.closePath();
      ctx.fill();

      // Cauda propulsora
      ctx.beginPath();
      ctx.moveTo(-26, 0);
      ctx.lineTo(-42, -14);
      ctx.lineTo(-35, 0);
      ctx.lineTo(-42, 14);
      ctx.closePath();
      ctx.fill();

      // Olho predador neon
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(21, -4, 2.6, 0, Math.PI * 2);
      ctx.fill();

      // Animação de mordida (Bote Voraz)
      if (shark.biteAnimTimer > 0) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(32, 0, 16, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();
      }

      ctx.restore();

      // Barra de HP / Fôlego acima do Tubarão Alfa
      const sBarW = 64;
      const sBx = shark.x - sBarW / 2;
      const sBy = shark.y - (shark.megalodonBuffTimer > 0 ? 54 : 38);
      ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
      ctx.fillRect(sBx - 1, sBy - 1, sBarW + 2, 11);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(sBx, sBy, sBarW * Math.max(0, shark.hp / shark.maxHp), 5);
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(sBx, sBy + 6, sBarW * Math.max(0, shark.folego / shark.maxFolego), 3);

      // 9. Log de Dano Flutuante no Canvas (Seção 2.1)
      w.floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.font = `bold ${ft.size}px "Plus Jakarta Sans", monospace`;
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.min(1, ft.alpha);
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });
    };

    const loop = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      stepPhysics(dt);
      drawCanvas();
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [dealSharkDamageToEntity, executeEquippedSkill, handleEntityDefeated, spawnMarineEntity]);

  const equippedIds = profile?.habilidadesEquipadas || ['snap_strike', 'tail_sweep'];
  const slot1Skill = SKILLS_CATALOG.find(s => s.id === equippedIds[0]) || SKILLS_CATALOG[0];
  const slot2Skill = SKILLS_CATALOG.find(s => s.id === equippedIds[1]) || SKILLS_CATALOG[1];

  return (
    <div className="abyssal-ocean-panel">
      {/* Cabeçalho da Coluna Esquerda: Estado da Máquina de Navegação e Densidade */}
      <div className="ocean-panel-header">
        <div className="ocean-header-left">
          <span className="ocean-live-dot" data-active={expeditionState === 'em_andamento'} />
          <span className="ocean-panel-title">OCEANO AO VIVO (T{mapTelemetry?.tier || 1}: {mapTelemetry?.tierName})</span>
        </div>
        <div className="ocean-state-badges">
          <span
            className={`state-machine-pill ${navStateBadge.mode === 'COMANDO_MANUAL' ? 'manual' : 'patrol'}`}
            title="Máquina de Estados de Navegação (Seção 4.3)"
          >
            <Compass size={12} />
            {navStateBadge.mode === 'COMANDO_MANUAL'
              ? `COMANDO_MANUAL (${navStateBadge.targetX}, ${navStateBadge.targetY})`
              : 'PATRULHA_AUTOMATICA'}
          </span>
        </div>
      </div>

      {/* Área do Canvas 2D Acelerado por Hardware */}
      <div className="ocean-canvas-wrapper" onContextMenu={(e) => e.preventDefault()}>
        <canvas
          ref={canvasRef}
          width={780}
          height={540}
          className="abyssal-canvas"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
        />

        {/* Overlay Inicial (Pronto para Mergulhar) */}
        {expeditionState === 'pronto' && (
          <div className="ocean-freeze-overlay ready-mode">
            <div className="overlay-card">
              <div className="overlay-badge">EXPEDIÇÃO ABISSAL PRONTA</div>
              <h3>Tubarão Alfa Predador — Tier {mapTelemetry?.tier || 1}</h3>
              <p>
                Dificuldade Exponencial <strong>D = {mapTelemetry?.difficulty}</strong> • Máx.{' '}
                <strong>{mapTelemetry?.maxEntities} entidades</strong> na tela • Multiplicador XP{' '}
                <strong>{mapTelemetry?.xpMultiplier}x</strong>
              </p>
              <button className="btn-confirm-dive" onClick={onStartExpedition}>
                <Play size={18} fill="#ffffff" />
                <span>CONFIRMAR E MERGULHAR</span>
              </button>
            </div>
          </div>
        )}

        {/* Overlay de Pausa Manual */}
        {expeditionState === 'pausado' && (
          <div className="ocean-freeze-overlay paused-mode">
            <div className="overlay-card">
              <div className="overlay-badge">SIMULAÇÃO PAUSADA</div>
              <h3>Física Oceânica Congelada</h3>
              <p>Você pode inspecionar as 3 abas laterais ou retomar a expedição a qualquer momento.</p>
              <button className="btn-confirm-dive" onClick={onTogglePause}>
                <Play size={18} fill="#ffffff" />
                <span>RETOMAR EXPEDIÇÃO</span>
              </button>
            </div>
          </div>
        )}

        {/* Tela de Derrota e Reconfiguração (Seção 7 - Sem Reinício Automático!) */}
        {expeditionState === 'derrota' && (
          <div className="ocean-freeze-overlay death-mode">
            <div className="overlay-card death-card">
              <div className="death-header-badge">
                <Skull size={18} color="#f43f5e" />
                <span>CICLO DE DERROTA — SIMULAÇÃO 100% CONGELADA</span>
              </div>
              <h3>Tubarão Alfa Abatido nas Profundezas (Tier {deathReport?.tier || mapTelemetry?.tier})</h3>

              <div className="death-analytic-box">
                <div className="analytic-label">
                  <ShieldAlert size={14} color="#fa6400" />
                  <span>Relatório Analítico de Óbito:</span>
                </div>
                <div className="analytic-value">{deathReport?.causaMorte || 'Abatido por Inimigos do Mar'}</div>
              </div>

              <div className="death-stats-grid">
                <div className="death-stat-cell">
                  <span>Sobrevivência</span>
                  <strong>{deathReport?.tempoSobrevivenciaSegundos || 0}s</strong>
                </div>
                <div className="death-stat-cell">
                  <span>Inimigos Abatidos</span>
                  <strong>{deathReport?.inimigosAbatidos || 0}</strong>
                </div>
                <div className="death-stat-cell">
                  <span>XP Ganho no Run</span>
                  <strong style={{ color: '#00e5ff' }}>+{deathReport?.xpTotalGanho || 0} XP</strong>
                </div>
                <div className="death-stat-cell">
                  <span>Biomassa Coletada</span>
                  <strong style={{ color: '#b03af0' }}>+{deathReport?.biomassaGanha || 0}</strong>
                </div>
              </div>

              <p className="death-reconfig-hint">
                Ajuste livremente suas <strong>Passivas (Aba 1)</strong>, troque as{' '}
                <strong>2 Habilidades (Aba 2)</strong> ou reconfigure o <strong>Mapa (Aba 3)</strong> antes de
                autorizar o novo mergulho:
              </p>

              <div className="death-quick-tabs">
                <button type="button" className="btn-reconfig-tab" onClick={() => onSelectTab('passivas')}>
                  🌳 Aba 1: Passivas ({profile?.pontosPassivaDisponiveis || 0} pts)
                </button>
                <button type="button" className="btn-reconfig-tab" onClick={() => onSelectTab('skills')}>
                  ⚡ Aba 2: Loadout (2 Skills)
                </button>
                <button type="button" className="btn-reconfig-tab" onClick={() => onSelectTab('mapa')}>
                  🗺️ Aba 3: Map Device
                </button>
              </div>

              <button type="button" className="btn-confirm-dive" onClick={onStartExpedition}>
                <Play size={18} fill="#ffffff" />
                <span>CONFIRMAR E MERGULHAR</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* HUD Inferior de Atalhos no Oceano: [Slot 1: Q / Clique E] [Slot 2: W / Clique D] (Seção 2.1 e 4.1) */}
      <div className="ocean-bottom-hud">
        <div className="hud-skills-group">
          {[
            { slot: 1, skill: slot1Skill, keyLabel: controlMapping?.slot1 || 'Q / Clique E', cd: skillCooldownsUi.slot1, idx: 0 },
            { slot: 2, skill: slot2Skill, keyLabel: controlMapping?.slot2 || 'W / Clique D / Espaço', cd: skillCooldownsUi.slot2, idx: 1 }
          ].map(({ slot, skill, keyLabel, cd, idx }) => {
            const mult = computeSkillSynergyMultiplier(skill);
            return (
              <button
                key={slot}
                type="button"
                className={`hud-skill-slot ${cd > 0 ? 'on-cooldown' : ''}`}
                style={{ borderColor: skill.color }}
                onClick={() => executeEquippedSkill(idx, worldRef.current.mouseX, worldRef.current.mouseY)}
              >
                <div className="hud-skill-icon" style={{ background: `${skill.color}22`, color: skill.color }}>
                  <span>{skill.icon}</span>
                  {cd > 0 && <div className="hud-cd-overlay">{cd}s</div>}
                </div>
                <div className="hud-skill-info">
                  <div className="hud-skill-top">
                    <span className="hud-slot-key">Slot {slot}: [{keyLabel}]</span>
                    <span className="hud-synergy-pill">Sinergia {(mult * 100).toFixed(0)}%</span>
                  </div>
                  <div className="hud-skill-name">{skill.shortName}</div>
                  <div className="hud-skill-meta">
                    <span>
                      Custo: <strong>{skill.cost} {skill.resourceType === 'frenesi' ? 'Frenesi' : 'Fôlego'}</strong>
                    </span>
                    <span>CD: {skill.cooldown}s</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="hud-ocean-actions">
          {expeditionState === 'em_andamento' || expeditionState === 'pausado' ? (
            <button type="button" className="btn-hud-pause" onClick={onTogglePause}>
              {expeditionState === 'pausado' ? <Play size={15} /> : <Pause size={15} />}
              <span>{expeditionState === 'pausado' ? 'Retomar' : 'Pausar'}</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
