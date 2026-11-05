import React, { useState, useRef, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Search, Compass } from 'lucide-react';
import { findShortestPathToAllocate, canUnallocateSingleNode, SKILLS_CATALOG } from '../data/gameCatalog';

const TREE_CATEGORIES = {
  NW: {
    id: 'NW',
    color: '#FF6B8B',
    bgLight: '#FFE4EC',
    textColor: '#BE123C',
    label: 'Mordida & Ataque'
  },
  NE: {
    id: 'NE',
    color: '#FF9F43',
    bgLight: '#FFF0E0',
    textColor: '#C2410C',
    label: 'Projéteis & Área'
  },
  SW: {
    id: 'SW',
    color: '#0284C7',
    bgLight: '#E0F2FE',
    textColor: '#0369A1',
    label: 'Defesa & Fôlego'
  },
  SE: {
    id: 'SE',
    color: '#10B981',
    bgLight: '#D1FAE5',
    textColor: '#047857',
    label: 'Velocidade & Utilidade'
  }
};

function getCategoryByNode(node) {
  if (!node) return TREE_CATEGORIES.SW;
  return TREE_CATEGORIES[node.quadrant] || TREE_CATEGORIES.SW;
}

function cleanSkillName(rawName = '') {
  return rawName
    .replace(/^KEYSTONE:\s*/i, '')
    .replace(/\s*\([A-Z]{2}-\d+\)\s*$/i, '')
    .trim();
}

function cleanSkillEffect(rawDesc = '') {
  return rawDesc.replace(/^Notável:\s*/i, '').trim();
}

export default function PassiveTreeTab({
  treeData,
  profile,
  onAllocateNodes,
  onResetPassives,
  statusMessage
}) {
  const [zoom, setZoom] = useState(0.46);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNode, setHoveredNode] = useState(null);

  const allocatedIds = profile?.nosPassivas || [];
  const allocatedSet = useMemo(() => new Set(['root', ...allocatedIds]), [allocatedIds]);
  const pointsAvailable = profile?.pontosPassivaDisponiveis ?? 1;

  // Tags das 2 habilidades equipadas atualmente para destacar sinergias visuais na árvore
  const equippedSkillTags = useMemo(() => {
    const eq = profile?.habilidadesEquipadas || ['snap_strike', 'tail_sweep'];
    const tags = new Set();
    eq.forEach((id) => {
      const sk = SKILLS_CATALOG.find(s => s.id === id);
      if (sk) sk.tags.forEach(t => tags.add(t));
    });
    return tags;
  }, [profile?.habilidadesEquipadas]);

  // Caminho mais curto até o nó sob o cursor
  const previewPath = useMemo(() => {
    if (!hoveredNode || hoveredNode.id === 'root' || allocatedSet.has(hoveredNode.id)) return [];
    return findShortestPathToAllocate(treeData, allocatedIds, hoveredNode.id);
  }, [treeData, allocatedIds, hoveredNode, allocatedSet]);

  const previewPathSet = useMemo(() => new Set(previewPath), [previewPath]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    setZoom(z => Math.max(0.24, Math.min(1.45, Number((z * factor).toFixed(2)))));
  };

  const centerTree = () => {
    setPan({ x: 0, y: 0 });
    setZoom(0.46);
  };

  const handleNodeClick = (node) => {
    if (!node || node.id === 'root') return;

    if (allocatedSet.has(node.id)) {
      if (canUnallocateSingleNode(treeData, allocatedIds, node.id)) {
        const nextIds = allocatedIds.filter(id => id !== node.id);
        onAllocateNodes(nextIds);
      }
      return;
    }

    const pathToAllocate = findShortestPathToAllocate(treeData, allocatedIds, node.id);
    if (pathToAllocate.length === 0) return;

    if (pathToAllocate.length <= pointsAvailable && allocatedIds.length + pathToAllocate.length <= 30) {
      const nextIds = [...allocatedIds, ...pathToAllocate];
      onAllocateNodes(nextIds);
    }
  };

  if (!treeData) {
    return <div className="tab-loading">Carregando Árvore de Passivas...</div>;
  }

  const hoveredCat = hoveredNode ? getCategoryByNode(hoveredNode) : null;

  return (
    <div className="passive-tree-tab">
      {/* Barra Superior Limpa */}
      <div className="passive-top-toolbar">
        <div className="points-badges">
          <span className="pt-badge allocated">
            Passivas Ativas: <strong>{allocatedIds.length}</strong>
          </span>
          <span className="pt-badge available">
            Pontos Livres: <strong>{pointsAvailable}</strong>
          </span>
        </div>
        <button
          type="button"
          className="btn-respec-tree"
          onClick={onResetPassives}
          disabled={allocatedIds.length === 0}
          title="Reembolsar pontos de passiva"
        >
          <RotateCcw size={13} />
          <span>Reembolsar Pontos</span>
        </button>
      </div>

      {/* Barra de Busca (Sem Seleção de Categorias) */}
      <div className="tree-controls-bar">
        <div className="tree-filter-row">
          <div className="tree-search-box full-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Buscar pelo nome da habilidade ou efeito..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Visualizador Interativo do Grafo */}
      <div
        className="passive-graph-viewport"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Botões Flutuantes de Zoom */}
        <div className="graph-zoom-controls" onMouseDown={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => setZoom(z => Math.min(1.45, Number((z + 0.12).toFixed(2))))} title="Aumentar Zoom">
            <ZoomIn size={15} />
          </button>
          <button type="button" onClick={() => setZoom(z => Math.max(0.24, Number((z - 0.12).toFixed(2))))} title="Reduzir Zoom">
            <ZoomOut size={15} />
          </button>
          <button type="button" onClick={centerTree} title="Centralizar Árvore">
            <Compass size={15} />
          </button>
        </div>

        <svg className="passive-graph-svg" viewBox="-420 -360 840 720">
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Divisórias suaves das 4 Categorias */}
            <line x1="-820" y1="0" x2="820" y2="0" stroke="rgba(2, 132, 199, 0.2)" strokeDasharray="10 10" strokeWidth="2.5" />
            <line x1="0" y1="-820" x2="0" y2="820" stroke="rgba(2, 132, 199, 0.2)" strokeDasharray="10 10" strokeWidth="2.5" />

            {/* Rótulos das 4 Categorias no Fundo do Grafo (Apenas Conteúdo Sequente, Sem Nome da Cor) */}
            <text x="-520" y="-560" fill="#E11D48" fontSize="22" fontWeight="800" textAnchor="middle">
              MORDIDA & ATAQUE
            </text>
            <text x="520" y="-560" fill="#EA580C" fontSize="22" fontWeight="800" textAnchor="middle">
              PROJÉTEIS & ÁREA
            </text>
            <text x="-520" y="590" fill="#0284C7" fontSize="22" fontWeight="800" textAnchor="middle">
              DEFESA & FÔLEGO
            </text>
            <text x="520" y="590" fill="#059669" fontSize="22" fontWeight="800" textAnchor="middle">
              VELOCIDADE & UTILIDADE
            </text>

            {/* Arestas do Grafo */}
            {treeData.edges.map((edge) => {
              const sourceNode = edge.source === 'root' ? treeData.root : treeData.nodes.find(n => n.id === edge.source);
              const targetNode = edge.target === 'root' ? treeData.root : treeData.nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const bothAllocated = allocatedSet.has(edge.source) && allocatedSet.has(edge.target);
              const inPreview =
                (allocatedSet.has(edge.source) || previewPathSet.has(edge.source)) &&
                (allocatedSet.has(edge.target) || previewPathSet.has(edge.target)) &&
                (previewPathSet.has(edge.source) || previewPathSet.has(edge.target));

              return (
                <line
                  key={edge.id}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={
                    bothAllocated
                      ? '#0284C7'
                      : inPreview
                      ? '#F59E0B'
                      : 'rgba(100, 149, 200, 0.35)'
                  }
                  strokeWidth={bothAllocated ? 4.5 : inPreview ? 3.5 : 1.8}
                />
              );
            })}

            {/* Nó Raiz Central */}
            <g transform="translate(0, 0)">
              <circle r={25} fill="#FFFFFF" stroke="#0284C7" strokeWidth={4.5} />
              <circle r={13} fill="#38BDF8" />
              <text y={42} fill="#1E3A5F" fontSize="15" fontWeight="800" textAnchor="middle">
                Origem
              </text>
            </g>

            {/* Nós da Árvore Coloridos por Categoria */}
            {treeData.nodes.map((node) => {
              const isAllocated = allocatedSet.has(node.id);
              const isPreview = previewPathSet.has(node.id);
              const cat = getCategoryByNode(node);

              const cleanedName = cleanSkillName(node.name);
              const cleanedEffect = cleanSkillEffect(node.description);

              const matchesSearch =
                !searchQuery.trim() ||
                cleanedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cleanedEffect.toLowerCase().includes(searchQuery.toLowerCase());

              const hasEquippedSynergy = node.tags.some(t => equippedSkillTags.has(t));

              const radius = node.type === 'keystone' ? 17 : node.type === 'notable' ? 12.5 : 9;
              const strokeColor = isAllocated
                ? '#1E3A5F'
                : isPreview
                ? '#F59E0B'
                : hasEquippedSynergy
                ? cat.color
                : 'rgba(30, 58, 95, 0.35)';

              const fillColor = isAllocated
                ? cat.color
                : isPreview
                ? '#FDE047'
                : '#FFFFFF';

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  style={{
                    cursor: 'pointer',
                    opacity: matchesSearch ? 1 : 0.2
                  }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(node);
                  }}
                >
                  <circle
                    r={radius}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isAllocated ? 3.5 : 2.2}
                  />
                  {!isAllocated && (
                    <circle
                      r={Math.max(3.5, radius - 4)}
                      fill={cat.color}
                      opacity={0.75}
                    />
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Inspetor Simplificado: Badge Colorido com Conteúdo da Categoria, Nome da Habilidade e Efeitos */}
        <div className="passive-node-inspector" onMouseDown={(e) => e.stopPropagation()}>
          {hoveredNode && hoveredCat ? (
            <div className="inspector-simplified-content">
              <div className="inspector-header">
                <span
                  className="inspector-type-badge"
                  style={{
                    backgroundColor: hoveredCat.bgLight,
                    borderColor: hoveredCat.color,
                    color: hoveredCat.textColor
                  }}
                >
                  <span className="cat-color-dot" style={{ backgroundColor: hoveredCat.color }} />
                  Tipo de Categoria: {hoveredCat.label}
                </span>
              </div>
              <div className="inspector-name">
                <strong>Nome da Habilidade:</strong> {cleanSkillName(hoveredNode.name)}
              </div>
              <p className="inspector-desc">
                <strong>Efeitos:</strong> {cleanSkillEffect(hoveredNode.description)}
              </p>
            </div>
          ) : (
            <div className="inspector-empty">
              Passe o mouse sobre qualquer esfera da árvore para ver o <strong>Tipo de Categoria</strong>, o <strong>Nome da Habilidade</strong> e os <strong>Seus Efeitos</strong>.
            </div>
          )}
        </div>
      </div>

      {statusMessage && <div className="tree-status-msg">{statusMessage}</div>}
    </div>
  );
}
