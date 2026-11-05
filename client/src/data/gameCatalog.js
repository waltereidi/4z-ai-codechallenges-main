// ============================================================================
// Shark Tank: Abyssal Exile — Catálogo, Fórmulas e Árvore de 300 Nós (Frontend)
// ============================================================================

export const MAX_TREE_VARIATIONS = 300;
export const MAX_SHARK_LEVEL = 30; // Regra de Ouro 1:10 (300 / 10 = 30)

export const SKILLS_CATALOG = [
  {
    id: 'snap_strike',
    name: 'Bote Voraz (Snap Strike)',
    shortName: 'Bote Voraz',
    tags: ['Mordida', 'Ataque', 'Físico', 'Sangramento'],
    resourceType: 'folego',
    cost: 18,
    cooldown: 0.8,
    baseDamage: 48,
    range: 240,
    bleedBaseChance: 0.35,
    description: 'Avança como um raio até a posição do cursor e morde com alto dano perfurante.',
    typicalSlot: 'Slot 1 (Q / Clique E)',
    color: '#00e5ff',
    icon: '⚡'
  },
  {
    id: 'tail_sweep',
    name: 'Vórtice de Cauda',
    shortName: 'Vórtice de Cauda',
    tags: ['Área', 'Movimento', 'Físico'],
    resourceType: 'folego',
    cost: 32,
    cooldown: 3.5,
    baseDamage: 38,
    radius: 125,
    stunDuration: 1.5,
    destroysProjectiles: true,
    knockback: 95,
    description: 'Giro de 360° que destrói projéteis inimigos, repele águas-vivas e causa atordoamento.',
    typicalSlot: 'Slot 2 (W / Clique D)',
    color: '#b03af0',
    icon: '🌀'
  },
  {
    id: 'denticle_salvo',
    name: 'Salva de Dentículos',
    shortName: 'Salva de Dentículos',
    tags: ['Projétil', 'Físico', 'Ataque'],
    resourceType: 'folego',
    cost: 26,
    cooldown: 2.2,
    baseDamage: 25,
    projectileCount: 5,
    spreadAngle: 0.62,
    projectileSpeed: 460,
    description: 'Dispara rajada cônica de 5 dentes cortantes na direção apontada pelo cursor do mouse.',
    typicalSlot: 'Slot 1 ou 2',
    color: '#fa6400',
    icon: '🔱'
  },
  {
    id: 'megalodon_frenzy',
    name: 'Frenesi do Megalodonte',
    shortName: 'Frenesi Megalodonte',
    tags: ['Grito', 'Buff', 'Mordida', 'Área'],
    resourceType: 'frenesi',
    cost: 3,
    cooldown: 20.0,
    baseDamage: 30,
    duration: 6.0,
    damageBuffPct: 1.0,
    lifeLeechBuff: 0.35,
    scaleMultiplier: 1.55,
    description: 'O tubarão ruge, dobra de escala e recebe +100% de dano e 35% de roubo de vida por 6s.',
    typicalSlot: 'Slot 2 (W)',
    color: '#f43f5e',
    icon: '🩸'
  },
  {
    id: 'evasive_propulsion',
    name: 'Propulsão Evasiva',
    shortName: 'Propulsão Evasiva',
    tags: ['Movimento', 'Defesa'],
    resourceType: 'folego',
    cost: 15,
    cooldown: 4.0,
    baseDamage: 15,
    dashDistance: 210,
    iframeDuration: 0.35,
    description: 'Impulso rápido com imunidade total a dano e colisão durante 0.35s (i-frame).',
    typicalSlot: 'Slot 2 (W / Espaço)',
    color: '#10b981',
    icon: '🛡️'
  }
];

export const BESTIARY_CATALOG = [
  {
    id: 'presa_comum',
    name: 'Presa Comum (Sardinha / Atum)',
    category: 'PresaComum',
    behavior: 'Fuga em cardume',
    damageMechanic: 'Não causa dano (passivo)',
    rewardText: 'Recupera 10% de HP, restaura 15 de Fôlego e gera 1 Carga de Frenesi',
    baseHp: 22,
    baseDamage: 0,
    damageType: 'Nenhum',
    baseXp: 5,
    baseBiomass: 4,
    speed: 75,
    color: '#38bdf8'
  },
  {
    id: 'agua_viva_toxica',
    name: 'Água-viva Tóxica',
    category: 'AguaVivaToxica',
    behavior: 'Flutuação vertical oscilante',
    damageMechanic: 'Dano contínuo de veneno por segundo ao tocar no corpo',
    rewardText: 'Biomassa Cáustica e XP básico',
    baseHp: 68,
    baseDamage: 11,
    damageType: 'Veneno Cáustico de Água-viva',
    baseXp: 14,
    baseBiomass: 9,
    speed: 48,
    color: '#d946ef'
  },
  {
    id: 'enguia_eletrica',
    name: 'Enguia Elétrica',
    category: 'EnguiaEletrica',
    behavior: 'Nado sinuoso em alta velocidade',
    damageMechanic: 'Dispara projétil elétrico linear que atordoa o tubarão por 1 segundo',
    rewardText: 'XP elevado e Biomassa Voltáica',
    baseHp: 95,
    baseDamage: 16,
    damageType: 'Dano Elétrico de Enguia Abissal',
    baseXp: 24,
    baseBiomass: 15,
    speed: 115,
    color: '#facc15'
  },
  {
    id: 'caranguejo_couracado',
    name: 'Caranguejo Couraçado',
    category: 'CaranguejoBlindado',
    behavior: 'Rasteja pelo leito oceânico',
    damageMechanic: 'Carapaça frontal que reduz dano recebido em 75% e reflete espinhos',
    rewardText: 'Biomassa Chitinosa e minérios de mapa',
    baseHp: 165,
    baseDamage: 14,
    damageType: 'Espinhos de Caranguejo Couraçado',
    baseXp: 32,
    baseBiomass: 22,
    speed: 42,
    color: '#f97316'
  },
  {
    id: 'peixe_pescador_abissal',
    name: 'Peixe-Pescador Abissal',
    category: 'PeixePescadorAbissal',
    behavior: 'Camuflado nas sombras; avanço repentino',
    damageMechanic: 'Mordida perfurante com 40% de chance de causar Sangramento',
    rewardText: 'XP massivo e fragmentos de afixos',
    baseHp: 140,
    baseDamage: 22,
    damageType: 'Mordida Perfurante de Peixe-Pescador',
    baseXp: 45,
    baseBiomass: 30,
    speed: 98,
    color: '#ef4444'
  },
  {
    id: 'leviata_abissal',
    name: 'Leviatã Abissal (Chefe)',
    category: 'LeviataChefe',
    behavior: 'Invoca tentáculos e vórtices',
    damageMechanic: 'Ataques em área telegrafados e ondas de choque',
    rewardText: 'Desbloqueia Tiers superiores de mapas',
    baseHp: 620,
    baseDamage: 35,
    damageType: 'Onda de Choque do Leviatã Abissal',
    baseXp: 180,
    baseBiomass: 120,
    speed: 62,
    color: '#ec4899'
  }
];

export const RARE_AFFIXES_CATALOG = [
  {
    id: 'criogenico',
    name: 'Criogênico',
    auraColor: '#00e5ff',
    description: 'Aura Azul: Desacelera o tubarão em 35% ao redor.',
    slowPct: 0.35,
    auraRadius: 120
  },
  {
    id: 'vampirico',
    name: 'Vampírico',
    auraColor: '#f43f5e',
    description: 'Aura Vermelha: Recupera a própria vida a cada ataque desferido no jogador.',
    leechPct: 0.65,
    auraRadius: 95
  },
  {
    id: 'lorde_espinhos',
    name: 'Lorde dos Espinhos',
    auraColor: '#f97316',
    description: 'Aura Laranja: Ao ser abatido, explode em 8 dentes pontiagudos em todas as direções.',
    deathSpikes: 8,
    auraRadius: 105
  }
];

export const MAP_AFFIXES_CATALOG = [
  {
    id: 'mare_rapida',
    name: 'Maré Rápida (+20% velocidade)',
    description: 'Inimigos do mar nadam e atacam com +20% de velocidade.',
    m: 0.20,
    w: 0.005,
    category: 'Velocidade',
    color: '#38bdf8'
  },
  {
    id: 'aguas_turvas',
    name: 'Águas Turvas',
    description: 'Camuflagem abissal ampliada e +22% de agressividade dos predadores.',
    m: 0.22,
    w: 0.08,
    category: 'Ambiente',
    color: '#8b5cf6'
  },
  {
    id: 'cardumes_toxicos',
    name: 'Cardumes Tóxicos',
    description: 'Águas-vivas proliferam em dobro e aplicam veneno +30% mais letal.',
    m: 0.28,
    w: 0.09,
    category: 'Veneno',
    color: '#d946ef'
  },
  {
    id: 'enguias_eletricas',
    name: 'Enguias Elétricas',
    description: 'Alta concentração de Enguias Elétricas com projéteis sobrecarregados.',
    m: 0.42,
    w: 0.18,
    category: 'Elétrico',
    color: '#facc15'
  },
  {
    id: 'reflexo_dano',
    name: 'Reflexo de Dano',
    description: 'Caranguejos Couraçados e criaturas refletem +25% de espinhos.',
    m: 0.38,
    w: 0.18,
    category: 'Físico',
    color: '#f97316'
  },
  {
    id: 'inimigos_raros',
    name: 'Inimigos Raros (Archnemesis)',
    description: 'Inimigos Raros com auras Criogênica, Vampírica e Espinhos surgem com +45% de frequência.',
    m: 0.55,
    w: 0.28,
    category: 'Raros',
    color: '#f43f5e'
  },
  {
    id: 'mare_acida',
    name: 'Maré Ácida Contínua',
    description: 'Água corrosiva abissal causa dano contínuo ao tubarão (1.8% HP/s).',
    m: 0.52,
    w: 0.24,
    category: 'Degeneração',
    color: '#10b981'
  },
  {
    id: 'leviata_supremo',
    name: 'Leviatã Supremo (Chefe)',
    description: 'Invoca o Chefe Leviatã Abissal com tentáculos e ondas de choque letais.',
    m: 0.65,
    w: 0.35,
    category: 'Chefe',
    color: '#ec4899'
  }
];

export const MAP_TIERS_CATALOG = [
  { tier: 1, name: 'Recifes Claros', depth: '50m', zoneType: 'Seguro' },
  { tier: 2, name: 'Baía Bioluminescente', depth: '120m', zoneType: 'Seguro' },
  { tier: 3, name: 'Corredor das Correntes', depth: '250m', zoneType: 'Fácil' },
  { tier: 4, name: 'Jardim de Medusas', depth: '420m', zoneType: 'Fácil' },
  { tier: 5, name: 'Fenda Crepuscular', depth: '680m', zoneType: 'Moderado' },
  { tier: 6, name: 'Platô Cáustico', depth: '950m', zoneType: 'Desafiador' },
  { tier: 7, name: 'Cânion das Enguias', depth: '1.300m', zoneType: 'Desafiador' },
  { tier: 8, name: 'Naufrágio Couraçado', depth: '1.750m', zoneType: 'Perigoso' },
  { tier: 9, name: 'Zona Batipelágica', depth: '2.300m', zoneType: 'Perigoso' },
  { tier: 10, name: 'Santuário Voltáico', depth: '3.000m', zoneType: 'Mortal' },
  { tier: 11, name: 'Trincheira de Sangue', depth: '3.850m', zoneType: 'Mortal' },
  { tier: 12, name: 'Abismo dos Pescadores', depth: '4.900m', zoneType: 'Brutal' },
  { tier: 13, name: 'Caldeira Sulfúrica', depth: '6.100m', zoneType: 'Extremo' },
  { tier: 14, name: 'Fossa Hadal Corrosiva', depth: '7.600m', zoneType: 'Extremo' },
  { tier: 15, name: 'Trono dos Tentáculos', depth: '9.200m', zoneType: 'Pesadelo' },
  { tier: 16, name: 'Fossa das Marianas Abissal', depth: '11.000m', zoneType: 'Pesadelo Abissal' }
];

// Tabela Comparativa Oficial (Seção 6.4)
export const REFERENCE_SCALING_PRESETS = [
  {
    tier: 1,
    label: 'T1',
    affixText: 'Nenhum (Águas Rasas)',
    affixes: [],
    difficulty: 10.0,
    maxEntities: 14,
    packIncrease: 'Base',
    xpMultiplier: '1.0x (5 XP)',
    biomassMultiplier: '1.0x',
    hazard: 'Seguro'
  },
  {
    tier: 3,
    label: 'T3',
    affixText: 'Maré Rápida (+20% velocidade)',
    affixes: ['mare_rapida'],
    difficulty: 19.7,
    maxEntities: 17,
    packIncrease: '+21%',
    xpMultiplier: '2.3x (11.5 XP)',
    biomassMultiplier: '1.8x',
    hazard: 'Fácil'
  },
  {
    tier: 6,
    label: 'T6',
    affixText: 'Águas Turvas + Cardumes Tóxicos',
    affixes: ['aguas_turvas', 'cardumes_toxicos'],
    difficulty: 58.2,
    maxEntities: 23,
    packIncrease: '+64%',
    xpMultiplier: '10.5x (52.5 XP)',
    biomassMultiplier: '4.9x',
    hazard: 'Desafiador'
  },
  {
    tier: 10,
    label: 'T10',
    affixText: 'Enguias Elétricas + Reflexo de Dano',
    affixes: ['enguias_eletricas', 'reflexo_dano'],
    difficulty: 245.8,
    maxEntities: 28,
    packIncrease: '+100%',
    xpMultiplier: '68.4x (342 XP)',
    biomassMultiplier: '17.8x',
    hazard: 'Mortal'
  },
  {
    tier: 14,
    label: 'T14',
    affixText: 'Inimigos Raros + Maré Ácida contínua',
    affixes: ['inimigos_raros', 'mare_acida'],
    difficulty: 892.1,
    maxEntities: 32,
    packIncrease: '+128%',
    xpMultiplier: '348.6x (1.743 XP)',
    biomassMultiplier: '56.2x',
    hazard: 'Extremo'
  },
  {
    tier: 16,
    label: 'T16',
    affixText: '4 Afixos Máximos + Leviatã Supremo',
    affixes: ['enguias_eletricas', 'reflexo_dano', 'inimigos_raros', 'mare_acida', 'leviata_supremo'],
    difficulty: 2418.0,
    maxEntities: 34,
    packIncrease: '+142% teto',
    xpMultiplier: '1.215.0x (6.075 XP)',
    biomassMultiplier: '138.4x',
    hazard: 'Pesadelo Abissal'
  }
];

export function calculateMapTelemetry(tierInput = 1, affixIds = [], passiveXpBonus = 0, passiveBiomassBonus = 0) {
  const T = Math.max(1, Math.min(16, Number(tierInput) || 1));
  const D0 = 10;
  const lambda = 0.28;

  const activeAffixes = (Array.isArray(affixIds) ? affixIds : [])
    .map(id => MAP_AFFIXES_CATALOG.find(a => a.id === id))
    .filter(Boolean);

  const weightSum = activeAffixes.reduce((acc, a) => acc + a.w, 0);
  const multiProd = activeAffixes.reduce((acc, a) => acc * (1 + a.m), 1);

  const rawD = D0 * Math.pow(1 + lambda, T - 1) * (1 + weightSum) * multiProd;
  const difficulty = Number(rawD.toFixed(1));

  const Nbase = 14;
  const nAffixes = activeAffixes.length;
  const extraEntities = Math.min(20, Math.floor(1.25 * (T - 1) + 1.5 * nAffixes));
  const maxEntities = Nbase + extraEntities;

  const rawFormulaXpFactor = Math.pow(1 + difficulty / D0, 1.25) * (1 + passiveXpBonus);
  const xpMultiplier = Number((Math.pow(difficulty / D0, 1.29) * (1 + passiveXpBonus)).toFixed(1));
  const basePreyXp = Number((5 * xpMultiplier).toFixed(1));
  const biomassMultiplier = Number((Math.pow(difficulty / D0, 0.90) * (1 + passiveBiomassBonus)).toFixed(1));

  let hazardLabel = 'Seguro';
  if (difficulty >= 1500) hazardLabel = 'Pesadelo Abissal';
  else if (difficulty >= 500) hazardLabel = 'Extremo';
  else if (difficulty >= 150) hazardLabel = 'Mortal';
  else if (difficulty >= 40) hazardLabel = 'Desafiador';
  else if (difficulty >= 15) hazardLabel = 'Fácil';

  const tierInfo = MAP_TIERS_CATALOG.find(t => t.tier === T) || MAP_TIERS_CATALOG[0];

  return {
    tier: T,
    tierName: tierInfo.name,
    depth: tierInfo.depth,
    difficulty,
    maxEntities,
    preyCountTarget: Math.max(6, Math.round(maxEntities * 0.58)),
    enemyCountTarget: Math.max(4, maxEntities - Math.max(6, Math.round(maxEntities * 0.58))),
    xpMultiplier,
    rawFormulaXpFactor: Number(rawFormulaXpFactor.toFixed(2)),
    basePreyXp,
    biomassMultiplier,
    hazardLabel,
    activeAffixes: activeAffixes.map(a => a.id),
    activeAffixObjects: activeAffixes
  };
}

// ============================================================================
// Utilitários de Caminho no Grafo de 300 Passivas (BFS Pathfinding)
// ============================================================================
export function findShortestPathToAllocate(treeData, allocatedIds = [], targetNodeId) {
  if (!treeData || !targetNodeId || targetNodeId === 'root') return [];
  const allocatedSet = new Set(['root', ...allocatedIds]);
  if (allocatedSet.has(targetNodeId)) return [];

  const nodeMap = new Map();
  nodeMap.set('root', treeData.root);
  treeData.nodes.forEach(n => nodeMap.set(n.id, n));

  if (!nodeMap.has(targetNodeId)) return [];

  // BFS multi-origem a partir de todos os nós já alocados + root
  const queue = [];
  const parentMap = new Map();
  const visited = new Set();

  allocatedSet.forEach((id) => {
    queue.push(id);
    visited.add(id);
  });

  while (queue.length > 0) {
    const curr = queue.shift();
    if (curr === targetNodeId) break;
    const node = nodeMap.get(curr);
    if (!node) continue;

    for (const neighbor of node.neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parentMap.set(neighbor, curr);
        queue.push(neighbor);
      }
    }
  }

  if (!parentMap.has(targetNodeId)) return [];

  const path = [];
  let step = targetNodeId;
  while (step && !allocatedSet.has(step)) {
    path.unshift(step);
    step = parentMap.get(step);
  }
  return path;
}

export function canUnallocateSingleNode(treeData, allocatedIds = [], nodeToRemove) {
  if (!treeData || !allocatedIds.includes(nodeToRemove)) return false;
  const remaining = allocatedIds.filter(id => id !== nodeToRemove);
  if (remaining.length === 0) return true;

  const nodeMap = new Map();
  nodeMap.set('root', treeData.root);
  treeData.nodes.forEach(n => nodeMap.set(n.id, n));

  const remainingSet = new Set(remaining);
  const visited = new Set(['root']);
  const queue = ['root'];

  while (queue.length > 0) {
    const curr = queue.shift();
    const node = nodeMap.get(curr);
    if (!node) continue;
    for (const nb of node.neighbors) {
      if (remainingSet.has(nb) && !visited.has(nb)) {
        visited.add(nb);
        queue.push(nb);
      }
    }
  }

  return remaining.every(id => visited.has(id));
}
