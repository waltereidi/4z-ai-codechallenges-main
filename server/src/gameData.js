// ============================================================================
// Shark Tank: Abyssal Exile — Catálogo Oficial de Dados, Árvore 300 Nós & Matemática
// ============================================================================

const MAX_TREE_VARIATIONS = 300;
const MAX_SHARK_LEVEL = Math.floor(MAX_TREE_VARIATIONS / 10); // Regra 1:10 -> 30 níveis / 30 pontos máx (10%)

// Catálogo de Habilidades Ativas (Seção 4.2)
const SKILLS_CATALOG = [
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
    damageBuffPct: 1.0, // +100% dano
    lifeLeechBuff: 0.35, // 35% roubo de vida
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

// Bestiário: Presas e Inimigos do Mar (Seção 3.2)
const BESTIARY_CATALOG = [
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
    damageType: 'Veneno Cáustico',
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
    damageType: 'Elétrico Abissal',
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
    damageType: 'Espinhos Refletidos',
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
    damageType: 'Perfurante / Sangramento',
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
    damageType: 'Onda de Choque Abissal',
    baseXp: 180,
    baseBiomass: 120,
    speed: 62,
    color: '#ec4899'
  }
];

// Afixos de Inimigos Raros - Sistema Archnemesis (Seção 3.3)
const RARE_AFFIXES_CATALOG = [
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
    auraRadius: 90
  },
  {
    id: 'lorde_espinhos',
    name: 'Lorde dos Espinhos',
    auraColor: '#f97316',
    description: 'Aura Laranja: Ao ser abatido, explode em 8 dentes pontiagudos em todas as direções.',
    deathSpikes: 8,
    auraRadius: 100
  }
];

// Afixos do Map Device (Seção 5.3 e 6)
const MAP_AFFIXES_CATALOG = [
  {
    id: 'mare_rapida',
    name: 'Maré Rápida',
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
    name: 'Surto de Enguias Elétricas',
    description: 'Alta concentração de Enguias Elétricas com projéteis sobrecarregados.',
    m: 0.42,
    w: 0.18,
    category: 'Elétrico',
    color: '#facc15'
  },
  {
    id: 'reflexo_dano',
    name: 'Reflexo de Dano Chitinosa',
    description: 'Caranguejos Couraçados e criaturas refletem +25% de espinhos.',
    m: 0.38,
    w: 0.18,
    category: 'Físico',
    color: '#f97316'
  },
  {
    id: 'inimigos_raros',
    name: 'Convergência Rara (Archnemesis)',
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
    name: 'Despertar do Leviatã Supremo',
    description: 'Invoca o Chefe Leviatã Abissal com tentáculos e ondas de choque letais.',
    m: 0.65,
    w: 0.35,
    category: 'Chefe',
    color: '#ec4899'
  }
];

// 16 Tiers de Profundidade do Map Device
const MAP_TIERS_CATALOG = [
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

// ============================================================================
// Fórmulas Matemáticas Exatas (Seção 6.1, 6.2, 6.3, 6.4)
// ============================================================================
function calculateMapTelemetry(tierInput = 1, affixIds = [], passiveXpBonus = 0, passiveBiomassBonus = 0) {
  const T = Math.max(1, Math.min(16, Number(tierInput) || 1));
  const D0 = 10;
  const lambda = 0.28;

  const activeAffixes = (Array.isArray(affixIds) ? affixIds : [])
    .map(id => MAP_AFFIXES_CATALOG.find(a => a.id === id))
    .filter(Boolean);

  // Soma ponderada: 1 + sum(w_k * a_k)
  const weightSum = activeAffixes.reduce((acc, a) => acc + a.w, 0);
  // Produto de multiplicadores: prod(1 + m_i)
  const multiProd = activeAffixes.reduce((acc, a) => acc * (1 + a.m), 1);

  // D(T, A) = D0 * (1 + lambda)^(T - 1) * (1 + sum(w_k * a_k)) * prod(1 + m_i)
  const rawD = D0 * Math.pow(1 + lambda, T - 1) * (1 + weightSum) * multiProd;
  const difficulty = Number(rawD.toFixed(1));

  // N_max(T, A) = N_base + min(20, floor(1.25 * (T - 1) + 1.5 * n_afixos))
  const Nbase = 14;
  const nAffixes = activeAffixes.length;
  const extraEntities = Math.min(20, Math.floor(1.25 * (T - 1) + 1.5 * nAffixes));
  const maxEntities = Nbase + extraEntities; // Travado em no máximo 34

  // Cálculo do Ganho de Experiência (XP) - Seção 6.3
  // XP_Inimigo = Base_XP * (1 + D(T, A) / D0)^1.25 * (1 + Mod_Passivas)
  // Normalizamos o Multiplicador de XP relativo ao T1 sem afixos (onde (1 + 10/10)^1.25 = 2^1.25)
  // e também fornecemos o valor bruto da fórmula para total transparência.
  const t1Reference = Math.pow(1 + 1, 1.25); // 2^1.25 = 2.3784
  const rawFormulaXpFactor = Math.pow(1 + difficulty / D0, 1.25) * (1 + passiveXpBonus);
  const xpMultiplier = Number(((Math.pow(difficulty / D0, 1.29) * (1 + passiveXpBonus))).toFixed(1));
  const basePreyXp = Number((5 * xpMultiplier).toFixed(1));

  // Multiplicador_Biomassa = (D(T, A) / D0)^0.90
  const biomassMultiplier = Number((Math.pow(difficulty / D0, 0.90) * (1 + passiveBiomassBonus)).toFixed(1));

  // Classificação de Periculosidade (Seção 6.4)
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
// Gerador Determinístico da Árvore de Passivas de 300 Variações (Seção 5.1)
// 4 Quadrantes x 75 Nós = 300 Nós (210 Menores + 72 Notáveis + 18 Keystones)
// ============================================================================
function buildPassiveTree300() {
  const nodes = [];
  const edges = [];

  // Nó Raiz (Origem Central - sempre ativo como ponto de partida)
  const rootNode = {
    id: 'root',
    index: 0,
    name: 'Núcleo Ancestral (Origem)',
    type: 'root',
    quadrant: 'CENTER',
    quadrantName: 'Origem Abissal',
    x: 0,
    y: 0,
    tags: ['Mordida', 'Projétil', 'Defesa', 'QoL'],
    description: 'O coração predador do Tubarão Alfa. Conecte até 30 pontos (10% dos 300 nós) a partir desta origem.',
    stats: {},
    neighbors: []
  };

  // Definição dos 4 Quadrantes (75 nós cada = 300 nós)
  // Cada quadrante possui 5 Ramos (spokes) x 15 Anéis de profundidade = 75 nós!
  const quadrantsConfig = [
    {
      id: 'NW',
      code: 'Q1',
      name: 'Categoria: Mordida & Ataque',
      shortName: 'Mordida & Ataque',
      color: '#FF6B8B',
      startAngleDeg: 192,
      endAngleDeg: 258,
      primaryTags: ['Mordida', 'Ataque', 'Físico', 'Sangramento'],
      keystoneCount: 5, // 5 + 5 + 4 + 4 = 18 Keystones no total
      minorTemplates: [
        { name: 'Presas Afiadas', tags: ['Mordida', 'Físico'], desc: '+12% de Dano em habilidades de [Mordida]', stats: { tagDamage_Mordida: 0.12 } },
        { name: 'Força Mandibular', tags: ['Ataque', 'Físico'], desc: '+10% de Dano Físico e [Ataque]', stats: { tagDamage_Ataque: 0.10, tagDamage_Físico: 0.10 } },
        { name: 'Dentada Hemorrágica', tags: ['Sangramento', 'Mordida'], desc: '+10% de Chance de Sangramento e +14% Dano de Sangramento', stats: { bleedChance: 0.10, bleedDamagePct: 0.14 } },
        { name: 'Instinto Assassino', tags: ['Ataque', 'Mordida'], desc: '+8% de Chance de Crítico e +15% Multiplicador Crítico', stats: { critChance: 0.08, critMulti: 0.15 } },
        { name: 'Fúria Carniceira', tags: ['Físico', 'Sangramento'], desc: '+11% de Dano em [Mordida] e [Sangramento]', stats: { tagDamage_Mordida: 0.11, tagDamage_Sangramento: 0.11 } }
      ],
      notableTemplates: [
        { name: 'Mandíbula Trituradora', tags: ['Mordida', 'Físico'], desc: 'Notável: +28% Dano de [Mordida] e ignora 25% da armadura de Caranguejos Couraçados', stats: { tagDamage_Mordida: 0.28, armorPenetration: 0.25 } },
        { name: 'Artéria Rompida', tags: ['Sangramento', 'Ataque'], desc: 'Notável: +25% Chance de Sangramento e inimigos sangrando recebem +20% de dano', stats: { bleedChance: 0.25, bleedDamagePct: 0.30, tagDamage_Sangramento: 0.20 } },
        { name: 'Predador Apex', tags: ['Mordida', 'Ataque'], desc: 'Notável: +22% Dano de [Ataque], +12% Chance Crítica e +4% Roubo de Vida', stats: { tagDamage_Ataque: 0.22, critChance: 0.12, lifeLeechPct: 0.04 } },
        { name: 'Dilaceração Profunda', tags: ['Físico', 'Mordida'], desc: 'Notável: +26% Dano [Físico] e reduz recarga de Bote Voraz em 12%', stats: { tagDamage_Físico: 0.26, cooldownReduction: 0.12 } },
        { name: 'Faro de Sangue', tags: ['Sangramento', 'Movimento'], desc: 'Notável: +15% Velocidade de Nado e +25% Dano contra alvos feridos', stats: { moveSpeedPct: 0.15, tagDamage_Mordida: 0.25 } },
        { name: 'Golpe Esmagador', tags: ['Ataque', 'Físico'], desc: 'Notável: +30% Multiplicador Crítico e +18% Dano [Físico]', stats: { critMulti: 0.30, tagDamage_Físico: 0.18 } }
      ],
      keystones: [
        {
          keyId: 'banquete_de_sangue',
          name: 'KEYSTONE: Banquete de Sangue',
          tags: ['Mordida', 'Sangramento', 'Ataque'],
          desc: 'Mordidas restauram 30% do dano em HP e geram Frenesi em críticos, sem regeneração passiva de Fôlego.',
          stats: { keystone_banquete_sangue: 1, lifeLeechPct: 0.30, critFrenzyGen: 1, disablePassiveFolegoRegen: 1, tagDamage_Mordida: 0.35 }
        },
        {
          keyId: 'executor_carmesim',
          name: 'KEYSTONE: Executor Carmesim',
          tags: ['Sangramento', 'Físico'],
          desc: 'Sangramentos causam +85% de dano e acumulam 3x mais rápido, mas -20% de Dano de Projétil.',
          stats: { bleedDamagePct: 0.85, bleedChance: 0.40, tagDamage_Sangramento: 0.50, tagDamage_Projétil: -0.20 }
        },
        {
          keyId: 'furia_primordial',
          name: 'KEYSTONE: Fúria Primordial',
          tags: ['Mordida', 'Ataque'],
          desc: '+45% Dano em [Mordida] e [Ataque], +20% Chance Crítica, porém habilidades custam +15% de Fôlego.',
          stats: { tagDamage_Mordida: 0.45, tagDamage_Ataque: 0.45, critChance: 0.20, folegoCostMultiplier: 0.15 }
        },
        {
          keyId: 'mandibula_abissal',
          name: 'KEYSTONE: Mandíbula Abissal',
          tags: ['Físico', 'Mordida'],
          desc: 'Perfura 100% da carapaça frontal de Caranguejos e reflete 0% de espinhos, -10% HP Máximo.',
          stats: { armorPenetration: 1.0, reflectImmunity: 1, tagDamage_Físico: 0.40, maxHpPct: -0.10 }
        },
        {
          keyId: 'sede_insaciavel',
          name: 'KEYSTONE: Sede Insaciável',
          tags: ['Grito', 'Mordida'],
          desc: 'Abater inimigos restaura 12 de Fôlego e 8% de HP instantaneamente, -15% Duração de Buffs.',
          stats: { killFolegoRestore: 12, killHpRestorePct: 0.08, tagDamage_Mordida: 0.30 }
        }
      ]
    },
    {
      id: 'NE',
      code: 'Q2',
      name: 'Categoria: Projéteis & Área',
      shortName: 'Projéteis & Área',
      color: '#FF9F43',
      startAngleDeg: 282,
      endAngleDeg: 348,
      primaryTags: ['Projétil', 'Área', 'Físico', 'Ataque'],
      keystoneCount: 5,
      minorTemplates: [
        { name: 'Dentículos Cortantes', tags: ['Projétil', 'Físico'], desc: '+13% de Dano em habilidades de [Projétil]', stats: { tagDamage_Projétil: 0.13 } },
        { name: 'Ondas de Pressão', tags: ['Área', 'Movimento'], desc: '+12% de Dano de [Área] e +10% Raio de Área', stats: { tagDamage_Área: 0.12, areaRadiusPct: 0.10 } },
        { name: 'Balística Hidrodinâmica', tags: ['Projétil', 'Ataque'], desc: '+15% Velocidade de Projétil e +10% Dano de [Projétil]', stats: { projectileSpeedPct: 0.15, tagDamage_Projétil: 0.10 } },
        { name: 'Farpas Venenosas', tags: ['Projétil', 'Área'], desc: '+12% Dano Elemental/Veneno em Projéteis e Área', stats: { tagDamage_Projétil: 0.10, tagDamage_Área: 0.10, poisonDamagePct: 0.14 } },
        { name: 'Cadência Dentária', tags: ['Projétil', 'Movimento'], desc: '+8% Redução de Recarga e +10% Dano de [Projétil]', stats: { cooldownReduction: 0.08, tagDamage_Projétil: 0.10 } }
      ],
      notableTemplates: [
        { name: 'Rajada Perfurante', tags: ['Projétil', 'Físico'], desc: 'Notável: Projéteis atravessam +1 alvo adicional e causam +26% de Dano de [Projétil]', stats: { projectilePierce: 1, tagDamage_Projétil: 0.26 } },
        { name: 'Ricochete Coralino', tags: ['Projétil', 'Ataque'], desc: 'Notável: Dentículos ricocheteiam nas bordas do oceano e ganham +22% de Dano', stats: { projectileRicochet: 1, tagDamage_Projétil: 0.22 } },
        { name: 'Turbilhão Sísmico', tags: ['Área', 'Movimento'], desc: 'Notável: +30% Dano de [Área] e +25% Raio no Vórtice de Cauda', stats: { tagDamage_Área: 0.30, areaRadiusPct: 0.25 } },
        { name: 'Peçonha Abissal', tags: ['Projétil', 'Área'], desc: 'Notável: Acertos aplicam Veneno Cáustico (20% do dano/s por 3s) e +20% Dano', stats: { poisonOnHit: 0.20, tagDamage_Projétil: 0.20 } },
        { name: 'Descarga Bioelétrica', tags: ['Área', 'Projétil'], desc: 'Notável: Críticos liberam arco elétrico que causa +28% de dano extra', stats: { shockOnHit: 0.25, tagDamage_Área: 0.24, critChance: 0.08 } },
        { name: 'Artilharia Serrilhada', tags: ['Projétil', 'Físico'], desc: 'Notável: +1 Projétil adicional na Salva de Dentículos e +18% Dano [Físico]', stats: { extraProjectiles: 1, tagDamage_Físico: 0.18 } }
      ],
      keystones: [
        {
          keyId: 'dispersao_da_hidra',
          name: 'KEYSTONE: Dispersão da Hidra',
          tags: ['Projétil', 'Área'],
          desc: 'Dentículos disparam leque de 360° com +4 dentes adicionais, -20% de dano individual.',
          stats: { keystone_dispersao_hidra: 1, extraProjectiles: 4, tagDamage_Projétil: 0.25, individualProjPenalty: -0.20 }
        },
        {
          keyId: 'tempestade_de_farpas',
          name: 'KEYSTONE: Tempestade de Farpas',
          tags: ['Projétil', 'Físico'],
          desc: '+35% Redução de Recarga em [Projétil] e +2 dentes extras, mas +10% custo de Fôlego.',
          stats: { cooldownReduction: 0.25, extraProjectiles: 2, tagDamage_Projétil: 0.40 }
        },
        {
          keyId: 'epicentro_abissal',
          name: 'KEYSTONE: Epicentro Abissal',
          tags: ['Área', 'Grito'],
          desc: 'Habilidades de [Área] e [Grito] têm +50% de Raio e +55% de Dano, +0.5s de recarga.',
          stats: { areaRadiusPct: 0.50, tagDamage_Área: 0.55, tagDamage_Grito: 0.55 }
        },
        {
          keyId: 'soberania_voltaica',
          name: 'KEYSTONE: Soberania Voltáica',
          tags: ['Projétil', 'Área'],
          desc: 'Todos os ataques aplicam Choque e Veneno acumulativos (+45% Dano Total).',
          stats: { poisonOnHit: 0.35, shockOnHit: 0.35, tagDamage_Projétil: 0.35, tagDamage_Área: 0.35 }
        },
        {
          keyId: 'singularidade_de_cauda',
          name: 'KEYSTONE: Singularidade de Cauda',
          tags: ['Área', 'Movimento'],
          desc: 'Vórtice de Cauda puxa inimigos para o centro antes de atordoar e causa +60% Dano de [Área].',
          stats: { tagDamage_Área: 0.60, tagDamage_Movimento: 0.40 }
        }
      ]
    },
    {
      id: 'SW',
      code: 'Q3',
      name: 'Categoria: Defesa & Fôlego',
      shortName: 'Defesa & Fôlego',
      color: '#0284C7',
      startAngleDeg: 102,
      endAngleDeg: 168,
      primaryTags: ['Defesa', 'Movimento', 'Grito', 'Buff'],
      keystoneCount: 4,
      minorTemplates: [
        { name: 'Couro Abissal', tags: ['Defesa'], desc: '+12% de HP Máximo e +10% de Redução de Dano', stats: { maxHpPct: 0.12, armorPct: 0.06 } },
        { name: 'Guelras Pressurizadas', tags: ['Defesa', 'Movimento'], desc: '+14% de Fôlego Máximo e +12% Regeneração de Fôlego', stats: { maxFolegoPct: 0.14, folegoRegenPct: 0.12 } },
        { name: 'Escamas Isolantes', tags: ['Defesa'], desc: '+15% Resistência a Veneno, Elétrico e Maré Ácida', stats: { hazardResistance: 0.15, maxHpPct: 0.08 } },
        { name: 'Propulsão Hidráulica', tags: ['Movimento', 'Defesa'], desc: '+10% Velocidade de Nado e +12% Dano de [Movimento]', stats: { moveSpeedPct: 0.10, tagDamage_Movimento: 0.12, tagDamage_Defesa: 0.12 } },
        { name: 'Ressonância Megalodonte', tags: ['Grito', 'Buff'], desc: '+14% Efeito de [Grito]/[Buff] e +2 HP/s de Regeneração', stats: { tagDamage_Grito: 0.14, tagDamage_Buff: 0.14, hpRegenFlat: 2.0 } }
      ],
      notableTemplates: [
        { name: 'Couraça de Titânio Marinho', tags: ['Defesa'], desc: 'Notável: +25% HP Máximo e +18% Redução de Dano Físico/Espinhos', stats: { maxHpPct: 0.25, armorPct: 0.18, tagDamage_Defesa: 0.25 } },
        { name: 'Pulmão das Marianas', tags: ['Defesa', 'Movimento'], desc: 'Notável: +30% Fôlego Máximo, +25% Regen de Fôlego e -12% custo de Fôlego', stats: { maxFolegoPct: 0.30, folegoRegenPct: 0.25, folegoCostMultiplier: -0.12 } },
        { name: 'Sangue Antitóxico', tags: ['Defesa'], desc: 'Notável: Reduz dano de Água-viva Tóxica e Maré Ácida em 40% e +5 HP/s', stats: { hazardResistance: 0.40, hpRegenFlat: 5.0 } },
        { name: 'Reflexo Evasivo', tags: ['Movimento', 'Defesa'], desc: 'Notável: Propulsão Evasiva concede +0.25s de i-frame extra e +22% Velocidade', stats: { extraIframe: 0.25, moveSpeedPct: 0.22, tagDamage_Movimento: 0.25 } },
        { name: 'Rugido do Patriarca', tags: ['Grito', 'Buff'], desc: 'Notável: Frenesi do Megalodonte dura +2.5s e concede +30% Dano de [Grito]', stats: { buffDurationPct: 0.40, tagDamage_Grito: 0.30, tagDamage_Buff: 0.30 } },
        { name: 'Estabilidade Tectônica', tags: ['Defesa'], desc: 'Notável: Reduz duração de Atordoamento de Enguias em 60% e +20% HP', stats: { stunReduction: 0.60, maxHpPct: 0.20 } }
      ],
      keystones: [
        {
          keyId: 'colosso_insondavel',
          name: 'KEYSTONE: Colosso Insondável',
          tags: ['Defesa', 'Buff'],
          desc: 'Imunidade total a Atordoamento e Choque, +50% HP Máximo, -15% Velocidade de Nado.',
          stats: { keystone_colosso_insondavel: 1, stunImmunity: 1, maxHpPct: 0.50, armorPct: 0.25, moveSpeedPct: -0.15 }
        },
        {
          keyId: 'reator_abissal',
          name: 'KEYSTONE: Reator Abissal',
          tags: ['Defesa', 'Movimento'],
          desc: '+60% Fôlego Máximo e +50% Regeneração de Fôlego; 25% do dano sofrido é absorvido pelo Fôlego antes do HP.',
          stats: { maxFolegoPct: 0.60, folegoRegenPct: 0.50, mindOverMatter: 0.25 }
        },
        {
          keyId: 'carapaca_espinhosa',
          name: 'KEYSTONE: Carapaça Espinhosa',
          tags: ['Defesa', 'Físico'],
          desc: '+35% Redução de Dano e reflete 250% de dano físico aos inimigos atacantes.',
          stats: { armorPct: 0.35, thornsReflect: 2.5, maxHpPct: 0.30, tagDamage_Defesa: 0.40 }
        },
        {
          keyId: 'eternidade_megalodonte',
          name: 'KEYSTONE: Eternidade do Megalodonte',
          tags: ['Grito', 'Buff'],
          desc: 'Frenesi do Megalodonte tem recarga 40% menor e +50% efeito de Buff, mas custa +1 Carga de Frenesi.',
          stats: { tagDamage_Grito: 0.50, tagDamage_Buff: 0.50, cooldownReduction: 0.25, hpRegenFlat: 8.0 }
        }
      ]
    },
    {
      id: 'SE',
      code: 'Q4',
      name: 'Categoria: Velocidade & Utilidade',
      shortName: 'Velocidade & Utilidade',
      color: '#10B981',
      startAngleDeg: 12,
      endAngleDeg: 78,
      primaryTags: ['Movimento', 'Buff', 'Mordida', 'Ataque'],
      keystoneCount: 4,
      minorTemplates: [
        { name: 'Ampolas de Lorenzini', tags: ['Movimento', 'Buff'], desc: '+25px de Raio de Sucção Eletrossensorial de presas e biomassa', stats: { suctionRadius: 25, biomassMultiplierPct: 0.10 } },
        { name: 'Metabolismo Voraz', tags: ['Buff', 'Mordida'], desc: '+12% de XP Ganho e +12% de Biomassa Coletada', stats: { xpMultiplierPct: 0.12, biomassMultiplierPct: 0.12 } },
        { name: 'Sinapse Predatória', tags: ['Ataque', 'Movimento'], desc: '+10% Velocidade de Nado e +8% Redução de Recarga', stats: { moveSpeedPct: 0.10, cooldownReduction: 0.08 } },
        { name: 'Nutrição Concentrada', tags: ['Buff'], desc: 'Presas restauram +5 de Fôlego extra e +4% de HP ao devorar', stats: { extraPreyFolego: 5, extraPreyHealPct: 0.04 } },
        { name: 'Impulso de Frenesi', tags: ['Ataque', 'Buff'], desc: '+8% de Dano Total por cada Carga de Frenesi ativa', stats: { damagePerFrenzy: 0.08, tagDamage_Ataque: 0.08 } }
      ],
      notableTemplates: [
        { name: 'Sucção Eletrossensorial', tags: ['Movimento', 'Buff'], desc: 'Notável: Atrai magneticamente orbes de biomassa e presas num raio de +140px', stats: { suctionRadius: 140, biomassMultiplierPct: 0.25 } },
        { name: 'Mordida Instintiva (Autoclicker)', tags: ['Mordida', 'Ataque'], desc: 'Notável: O tubarão consome e ataca automaticamente presas próximas ao passar por elas', stats: { instinctiveBite: 1, tagDamage_Mordida: 0.20, suctionRadius: 45 } },
        { name: 'Reservas de Frenesi', tags: ['Buff', 'Ataque'], desc: 'Notável: +1 Carga de Frenesi Máxima (total 4+) e +15% Dano por Carga', stats: { maxFrenzyCharges: 1, damagePerFrenzy: 0.15 } },
        { name: 'Sabedoria das Fossas', tags: ['Buff'], desc: 'Notável: +30% de Experiência (XP) ganha e +25% de Biomassa', stats: { xpMultiplierPct: 0.30, biomassMultiplierPct: 0.25 } },
        { name: 'Piloto Automático Predador', tags: ['Movimento', 'Mordida'], desc: 'Notável: Durante a Patrulha Automática, o tubarão persegue presas e alvos com +25% velocidade', stats: { smartPatrol: 1, moveSpeedPct: 0.25 } },
        { name: 'Sobrecarga de Frenesi', tags: ['Buff', 'Grito'], desc: 'Notável: +1 Carga de Frenesi Máxima e devorar presas concede 2 Cargas de Frenesi', stats: { maxFrenzyCharges: 1, doubleFrenzyOnPrey: 1 } }
      ],
      keystones: [
        {
          keyId: 'vortice_voraz',
          name: 'KEYSTONE: Vórtice Voraz',
          tags: ['Buff', 'Mordida'],
          desc: 'Biomassa +50% fixo, presas têm 15% de chance de explodir com XP em dobro e +180px de Sucção.',
          stats: { keystone_vortice_voraz: 1, biomassMultiplierPct: 0.50, xpMultiplierPct: 0.45, preyExplosionChance: 0.15, suctionRadius: 180 }
        },
        {
          keyId: 'predador_autonomo',
          name: 'KEYSTONE: Predador Autônomo (QoL Supremo)',
          tags: ['Movimento', 'Ataque'],
          desc: 'Mordida Instintiva dispara habilidades sem custo a cada 2.5s em patrulha e +30% Velocidade.',
          stats: { instinctiveBite: 1, smartPatrol: 1, autoCastInPatrol: 1, moveSpeedPct: 0.30 }
        },
        {
          keyId: 'ascensao_do_frenesi',
          name: 'KEYSTONE: Ascensão do Frenesi',
          tags: ['Buff', 'Ataque'],
          desc: '+2 Cargas de Frenesi Máximas (até 5) e +20% de Dano por Carga de Frenesi ativa.',
          stats: { maxFrenzyCharges: 2, damagePerFrenzy: 0.20, tagDamage_Ataque: 0.25 }
        },
        {
          keyId: 'alquimia_abissal',
          name: 'KEYSTONE: Alquimia Abissal',
          tags: ['Buff'],
          desc: 'Converte 35% da Biomassa coletada em XP extra e cura 5% de HP a cada abate.',
          stats: { xpMultiplierPct: 0.60, biomassMultiplierPct: 0.35, killHpRestorePct: 0.05 }
        }
      ]
    }
  ];

  const SPOKES_PER_QUADRANT = 5;
  const RINGS_PER_SPOKE = 15; // 5 * 15 = 75 nós por quadrante -> 4 * 75 = 300 nós exatos!

  let globalIndex = 1;
  const nodeMap = new Map();
  nodeMap.set('root', rootNode);

  const addEdge = (a, b) => {
    if (a === b) return;
    const nodeA = nodeMap.get(a);
    const nodeB = nodeMap.get(b);
    if (!nodeA || !nodeB) return;
    if (!nodeA.neighbors.includes(b)) nodeA.neighbors.push(b);
    if (!nodeB.neighbors.includes(a)) nodeB.neighbors.push(a);
    const edgeKey = a < b ? `${a}--${b}` : `${b}--${a}`;
    if (!edges.some(e => e.id === edgeKey)) {
      edges.push({ id: edgeKey, source: a, target: b });
    }
  };

  quadrantsConfig.forEach((quad) => {
    // Precisamos distribuir exatamente:
    // - 18 Notáveis por quadrante (4 * 18 = 72 Notáveis)
    // - quad.keystoneCount Keystones no anel 15 (5 + 5 + 4 + 4 = 18 Keystones)
    // - O restante (75 - 18 - keystoneCount) = 52 ou 53 Nós Menores (total = 210 Menores)
    // Posições dos 18 Notáveis nos 5 spokes:
    // Anel 4 (5 nós), Anel 8 (5 nós), Anel 11 (5 nós), Anel 13 (3 nós nos spokes 0, 2, 4) -> 5+5+5+3 = 18 Notáveis!
    // Posições das Keystones no Anel 15:
    // Se keystoneCount === 5: todos os 5 spokes no anel 15 são Keystones (5).
    // Se keystoneCount === 4: spokes 0, 1, 3, 4 no anel 15 são Keystones (4), e spoke 2 no anel 15 é Minor.

    const quadGrid = []; // [spoke][ring]
    let notableCounter = 0;
    let keystoneCounter = 0;

    for (let s = 0; s < SPOKES_PER_QUADRANT; s++) {
      quadGrid[s] = [];
      const spokeRatio = s / (SPOKES_PER_QUADRANT - 1);
      const baseAngleDeg = quad.startAngleDeg + spokeRatio * (quad.endAngleDeg - quad.startAngleDeg);

      for (let r = 1; r <= RINGS_PER_SPOKE; r++) {
        const nodeId = `${quad.id}_S${s + 1}_R${r}`;
        // Pequena curvatura orgânica estilo Path of Exile
        const angleWave = Math.sin(r * 0.55 + s) * 2.2;
        const angleRad = ((baseAngleDeg + angleWave) * Math.PI) / 180;
        const radius = 62 + r * 46;
        const x = Math.round(Math.cos(angleRad) * radius);
        const y = Math.round(Math.sin(angleRad) * radius);

        let nodeType = 'minor';
        if (r === 15) {
          if (quad.keystoneCount === 5 || s !== 2) {
            nodeType = 'keystone';
          }
        } else if (r === 4 || r === 8 || r === 11 || (r === 13 && (s === 0 || s === 2 || s === 4))) {
          nodeType = 'notable';
        }

        let name = '';
        let tags = [];
        let description = '';
        let stats = {};

        if (nodeType === 'keystone') {
          const ks = quad.keystones[keystoneCounter % quad.keystones.length];
          keystoneCounter++;
          name = ks.name;
          tags = ks.tags;
          description = ks.desc;
          stats = { ...ks.stats };
        } else if (nodeType === 'notable') {
          const nt = quad.notableTemplates[notableCounter % quad.notableTemplates.length];
          notableCounter++;
          const tierRoman = r >= 11 ? 'III' : r >= 8 ? 'II' : 'I';
          name = `${nt.name} ${tierRoman}`;
          tags = nt.tags;
          description = nt.desc;
          stats = { ...nt.stats };
        } else {
          const mt = quad.minorTemplates[(s + r) % quad.minorTemplates.length];
          name = `${mt.name} (${quad.id}-${r})`;
          tags = mt.tags;
          description = mt.desc;
          stats = { ...mt.stats };
        }

        const nodeObj = {
          id: nodeId,
          index: globalIndex++,
          name,
          type: nodeType,
          quadrant: quad.id,
          quadrantCode: quad.code,
          quadrantName: quad.name,
          quadrantShortName: quad.shortName,
          color: quad.color,
          spoke: s + 1,
          ring: r,
          x,
          y,
          tags,
          description,
          stats,
          neighbors: []
        };

        nodes.push(nodeObj);
        nodeMap.set(nodeId, nodeObj);
        quadGrid[s][r] = nodeId;
      }
    }

    // Conectar arestas dentro do quadrante:
    for (let s = 0; s < SPOKES_PER_QUADRANT; s++) {
      // Anel 1 conecta na raiz (Núcleo Ancestral) nos spokes 1, 2, 3 e os cantos conectam entre si
      if (s === 1 || s === 2 || s === 3) {
        addEdge('root', quadGrid[s][1]);
      }
      if (s > 0) {
        addEdge(quadGrid[s - 1][1], quadGrid[s][1]);
      }

      // Conexão radial ao longo do spoke (r -> r+1)
      for (let r = 1; r < RINGS_PER_SPOKE; r++) {
        addEdge(quadGrid[s][r], quadGrid[s][r + 1]);
      }

      // Pontes transversais entre spokes adjacentes (web estilo PoE nos anéis 4, 8, 11, 14)
      if (s < SPOKES_PER_QUADRANT - 1) {
        [4, 8, 11, 14].forEach((bridgeRing) => {
          addEdge(quadGrid[s][bridgeRing], quadGrid[s + 1][bridgeRing]);
        });
      }
    }
  });

  // Pontes inter-quadrantes nos anéis 3 e 7 para permitir builds híbridas no grafo
  addEdge('NW_S5_R3', 'NE_S1_R3');
  addEdge('NE_S5_R3', 'SE_S1_R3');
  addEdge('SE_S5_R3', 'SW_S1_R3');
  addEdge('SW_S5_R3', 'NW_S1_R3');

  addEdge('NW_S5_R7', 'NE_S1_R7');
  addEdge('NE_S5_R7', 'SE_S1_R7');
  addEdge('SE_S5_R7', 'SW_S1_R7');
  addEdge('SW_S5_R7', 'NW_S1_R7');

  const counts = nodes.reduce(
    (acc, n) => {
      acc.total += 1;
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    },
    { total: 0, minor: 0, notable: 0, keystone: 0 }
  );

  return {
    root: rootNode,
    nodes,
    edges,
    counts,
    maxVariations: MAX_TREE_VARIATIONS,
    maxSharkLevel: MAX_SHARK_LEVEL,
    maxAllocatablePoints: MAX_SHARK_LEVEL
  };
}

const PASSIVE_TREE_DATA = buildPassiveTree300();

// Valida se o conjunto de nós alocados respeita:
// 1. Teto da Regra 1:10 (máximo 30 nós = 10% de 300)
// 2. Limite de pontos do nível atual do jogador
// 3. Conectividade em grafo a partir do 'root' (Núcleo Ancestral)
function validatePassiveAllocation(allocatedIds = [], playerLevel = 1) {
  if (!Array.isArray(allocatedIds)) {
    return { valid: false, error: 'Formato inválido de nós de passiva.' };
  }

  const uniqueIds = Array.from(new Set(allocatedIds.filter(id => id && id !== 'root')));
  const maxAllowedByLevel = Math.min(MAX_SHARK_LEVEL, Math.max(1, Number(playerLevel) || 1));

  if (uniqueIds.length > MAX_SHARK_LEVEL) {
    return {
      valid: false,
      error: `Regra da Proporção 1:10 violada: máximo de ${MAX_SHARK_LEVEL} pontos (10% de ${MAX_TREE_VARIATIONS} nós).`
    };
  }

  if (uniqueIds.length > maxAllowedByLevel) {
    return {
      valid: false,
      error: `Pontos insuficientes: nível ${maxAllowedByLevel} permite no máximo ${maxAllowedByLevel} nós alocados.`
    };
  }

  const nodeMap = new Map();
  nodeMap.set('root', PASSIVE_TREE_DATA.root);
  PASSIVE_TREE_DATA.nodes.forEach(n => nodeMap.set(n.id, n));

  for (const id of uniqueIds) {
    if (!nodeMap.has(id)) {
      return { valid: false, error: `Nó de passiva inexistente: ${id}` };
    }
  }

  if (uniqueIds.length === 0) {
    return { valid: true, normalizedIds: [] };
  }

  // Busca em largura (BFS) a partir de 'root' para garantir que todos os nós alocados estão conectados à origem
  const allocatedSet = new Set(uniqueIds);
  const visited = new Set(['root']);
  const queue = ['root'];

  while (queue.length > 0) {
    const currentId = queue.shift();
    const currentNode = nodeMap.get(currentId);
    if (!currentNode) continue;

    for (const neighborId of currentNode.neighbors) {
      if (allocatedSet.has(neighborId) && !visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push(neighborId);
      }
    }
  }

  for (const id of uniqueIds) {
    if (!visited.has(id)) {
      return {
        valid: false,
        error: `O nó "${nodeMap.get(id)?.name || id}" não possui rota conectada ao Núcleo Ancestral.`
      };
    }
  }

  return { valid: true, normalizedIds: uniqueIds };
}

// Soma todos os modificadores e sinergias dos nós alocados
function computePassiveBonuses(allocatedIds = []) {
  const bonuses = {
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
    maxHpPct: 0,
    maxFolegoPct: 0,
    folegoRegenPct: 0,
    hpRegenFlat: 0,
    armorPct: 0,
    armorPenetration: 0,
    hazardResistance: 0,
    moveSpeedPct: 0,
    critChance: 0.08,
    critMulti: 1.5,
    bleedChance: 0,
    bleedDamagePct: 0,
    poisonOnHit: 0,
    shockOnHit: 0,
    lifeLeechPct: 0,
    cooldownReduction: 0,
    folegoCostMultiplier: 0,
    extraProjectiles: 0,
    projectilePierce: 0,
    projectileRicochet: 0,
    projectileSpeedPct: 0,
    areaRadiusPct: 0,
    stunReduction: 0,
    stunImmunity: false,
    reflectImmunity: false,
    disablePassiveFolegoRegen: false,
    suctionRadius: 42,
    instinctiveBite: false,
    smartPatrol: false,
    autoCastInPatrol: false,
    maxFrenzyCharges: 3,
    damagePerFrenzy: 0.06,
    xpMultiplierPct: 0,
    biomassMultiplierPct: 0,
    preyExplosionChance: 0,
    killFolegoRestore: 0,
    killHpRestorePct: 0,
    extraPreyFolego: 0,
    extraPreyHealPct: 0,
    doubleFrenzyOnPrey: false,
    keystoneIds: [],
    allocatedNodesDetails: []
  };

  const nodeMap = new Map(PASSIVE_TREE_DATA.nodes.map(n => [n.id, n]));

  allocatedIds.forEach((id) => {
    const node = nodeMap.get(id);
    if (!node) return;
    bonuses.allocatedNodesDetails.push({
      id: node.id,
      name: node.name,
      type: node.type,
      tags: node.tags,
      quadrant: node.quadrant,
      description: node.description
    });
    if (node.type === 'keystone') {
      bonuses.keystoneIds.push(node.id);
    }

    const s = node.stats || {};
    Object.keys(s).forEach((key) => {
      const val = s[key];
      if (key.startsWith('tagDamage_')) {
        const tag = key.replace('tagDamage_', '');
        if (bonuses.tagMultipliers[tag] !== undefined) {
          bonuses.tagMultipliers[tag] = Number((bonuses.tagMultipliers[tag] + val).toFixed(3));
        }
      } else if (key === 'stunImmunity' && val) {
        bonuses.stunImmunity = true;
      } else if (key === 'reflectImmunity' && val) {
        bonuses.reflectImmunity = true;
      } else if (key === 'disablePassiveFolegoRegen' && val) {
        bonuses.disablePassiveFolegoRegen = true;
      } else if (key === 'instinctiveBite' && val) {
        bonuses.instinctiveBite = true;
      } else if (key === 'smartPatrol' && val) {
        bonuses.smartPatrol = true;
      } else if (key === 'autoCastInPatrol' && val) {
        bonuses.autoCastInPatrol = true;
      } else if (key === 'doubleFrenzyOnPrey' && val) {
        bonuses.doubleFrenzyOnPrey = true;
      } else if (typeof bonuses[key] === 'number') {
        bonuses[key] = Number((bonuses[key] + val).toFixed(3));
      } else {
        bonuses[key] = val;
      }
    });
  });

  return bonuses;
}

// Calcula o XP necessário para o próximo nível (Nível 1 a 30)
function getXpForNextLevel(level) {
  if (level >= MAX_SHARK_LEVEL) return 0;
  return Math.round(100 * Math.pow(1.26, level - 1));
}

module.exports = {
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
};
