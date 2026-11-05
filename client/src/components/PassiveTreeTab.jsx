import React, { useState, useRef, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Search, Sparkles, Lock, CheckCircle2, Compass } from 'lucide-react';
import { findShortestPathToAllocate, canUnallocateSingleNode, SKILLS_CATALOG } from '../data/gameCatalog';

export default function PassiveTreeTab({
  treeData,
  profile,
  passiveBonuses,
  onAllocateNodes,
  onResetPassives,
  statusMessage
}) {
  const [zoom, setZoom] = useState(0.46);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const [selectedTagFilter, setSelectedTagFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNode, setHoveredNode] = useState(null);

  const allocatedIds = profile?.nosPassivas || [];
  const allocatedSet = useMemo(() => new Set(['root', ...allocatedIds]), [allocatedIds]);
  const pointsAvailable = profile?.pontosPassivaDisponiveis ?? 1;
  const currentLevel = profile?.nivel || 1;

  // Tags das 2 habilidades equipadas atualmente para destacar sinergias na árvore
  const equippedSkillTags = useMemo(() => {
    const eq = profile?.habilidadesEquipadas || ['snap_strike', 'tail_sweep'];
    const tags = new Set();
    eq.forEach((id) => {
      const sk = SKILLS_CATALOG.find(s => s.id === id);
      if (sk) sk.tags.forEach(t => tags.add(t));
    });
    return tags;
  }, [profile?.habilidadesEquipadas]);

  // Caminho mais curto até o nó sob o cursor (auto-pathing estilo Path of Exile)
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

  const focusQuadrant = (q) => {
    if (q === 'CENTER') {
      setPan({ x: 0, y: 0 });
      setZoom(0.46);
    } else if (q === 'NW') {
      setPan({ x: 145, y: 145 });
      setZoom(0.62);
    } else if (q === 'NE') {
      setPan({ x: -145, y: 145 });
      setZoom(0.62);
    } else if (q === 'SW') {
      setPan({ x: 145, y: -145 });
      setZoom(0.62);
    } else if (q === 'SE') {
      setPan({ x: -145, y: -145 });
      setZoom(0.62);
    }
  };

  const handleNodeClick = (node) => {
    if (!node || node.id === 'root') return;

    if (allocatedSet.has(node.id)) {
      // Tenta desalocar se não quebrar a conectividade do grafo
      if (canUnallocateSingleNode(treeData, allocatedIds, node.id)) {
        const nextIds = allocatedIds.filter(id => id !== node.id);
        onAllocateNodes(nextIds);
      }
      return;
    }

    // Aloca caminho mais curto conectado se houver pontos disponíveis
    const pathToAllocate = findShortestPathToAllocate(treeData, allocatedIds, node.id);
    if (pathToAllocate.length === 0) return;

    if (pathToAllocate.length <= pointsAvailable && allocatedIds.length + pathToAllocate.length <= 30) {
      const nextIds = [...allocatedIds, ...pathToAllocate];
      onAllocateNodes(nextIds);
    }
  };

  if (!treeData) {
    return <div className="tab-loading">Carregando Árvore de 300 Passivas...</div>;
  }

  const tagFilters = ['ALL', 'KEYSTONE', 'NOTABLE', 'Mordida', 'Projétil', 'Área', 'Sangramento', 'Defesa', 'Movimento', 'Grito', 'Buff'];

  return (
    <div className="passive-tree-tab">
      {/* Banner da Regra de Ouro 1:10 (Seção 5.1) */}
      <div className="golden-ratio-banner">
        <div className="ratio-banner-top">
          <span className="ratio-title">
            🌳 REGRA DA PROPORÇÃO 1:10 — <strong style={{ color: '#00e5ff' }}>300 Nós</strong> (Teto: Nv.30 = 30 pts / 10%)
          </span>
          <span className="ratio-counts-pill">
            210 Menores • 72 Notáveis • 18 Keystones
          </span>
        </div>
        <div className="ratio-Points-row">
          <div className="points-badges">
            <span className="pt-badge allocated">
              Alocados: <strong>{allocatedIds.length} / 30</strong> ({((allocatedIds.length / 300) * 100).toFixed(1)}% da Árvore)
            </span>
            <span className="pt-badge available">
              Disponíveis (Nv.{currentLevel}): <strong>{pointsAvailable} pts</strong>
            </span>
          </div>
          <button
            type="button"
            className="btn-respec-tree"
            onClick={onResetPassives}
            disabled={allocatedIds.length === 0}
            title="Reembolsar todos os pontos alocados para reconfigurar a build"
          >
            <RotateCcw size={13} />
            <span>Reembolsar ({allocatedIds.length})</span>
          </button>
        </div>
      </div>

      {/* Controles de Quadrante, Busca e Filtro de Tags */}
      <div className="tree-controls-bar">
        <div className="quadrant-jump-btns">
          <button type="button" onClick={() => focusQuadrant('CENTER')} className="q-btn center">Origem</button>
          <button type="button" onClick={() => focusQuadrant('NW')} className="q-btn nw" title="75 Nós: Mandíbula & Carnificina">NO: Mordida (75)</button>
          <button type="button" onClick={() => focusQuadrant('NE')} className="q-btn ne" title="75 Nós: Farpas & Elementos">NE: Projétil (75)</button>
          <button type="button" onClick={() => focusQuadrant('SW')} className="q-btn sw" title="75 Nós: Leviatã das Fendas">SO: Defesa (75)</button>
          <button type="button" onClick={() => focusQuadrant('SE')} className="q-btn se" title="75 Nós: Magnetismo Abissal QoL">SE: QoL (75)</button>
        </div>

        <div className="tree-filter-row">
          <div className="tree-search-box">
            <Search size={13} />
            <input
              type="text"
              placeholder="Buscar nó, tag ou Keystone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="tag-pills-scroll">
            {tagFilters.map((tf) => (
              <button
                key={tf}
                type="button"
                className={`tag-filter-pill ${selectedTagFilter === tf ? 'active' : ''}`}
                onClick={() => setSelectedTagFilter(tf)}
              >
                {tf === 'ALL' ? 'Todos (300)' : tf === 'KEYSTONE' ? '★ Keystones (18)' : tf === 'NOTABLE' ? '◆ Notáveis (72)' : `[${tf}]`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visualizador Interativo do Grafo de 300 Nós com Zoom e Pan */}
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
          <span className="zoom-pct">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom(z => Math.max(0.24, Number((z - 0.12).toFixed(2))))} title="Reduzir Zoom">
            <ZoomOut size={15} />
          </button>
          <button type="button" onClick={() => focusQuadrant('CENTER')} title="Centralizar Grafo">
            <Compass size={15} />
          </button>
        </div>

        <svg className="passive-graph-svg" viewBox="-420 -360 840 720">
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Divisórias sutis dos 4 Quadrantes */}
            <line x1="-820" y1="0" x2="820" y2="0" stroke="rgba(148, 163, 184, 0.14)" strokeDasharray="8 8" strokeWidth="2" />
            <line x1="0" y1="-820" x2="0" y2="820" stroke="rgba(148, 163, 184, 0.14)" strokeDasharray="8 8" strokeWidth="2" />

            {/* Rótulos dos 4 Quadrantes no Fundo do Grafo */}
            <text x="-520" y="-560" fill="rgba(244, 63, 94, 0.45)" fontSize="22" fontWeight="bold" textAnchor="middle">
              Q1 NOROESTE: MANDÍBULA & CARNIFICINA (75 NÓS)
            </text>
            <text x="520" y="-560" fill="rgba(250, 100, 0, 0.45)" fontSize="22" fontWeight="bold" textAnchor="middle">
              Q2 NORDESTE: FARPAS & ELEMENTOS (75 NÓS)
            </text>
            <text x="-520" y="590" fill="rgba(0, 229, 255, 0.45)" fontSize="22" fontWeight="bold" textAnchor="middle">
              Q3 SUDOESTE: LEVIATÃ DAS FENDAS (75 NÓS)
            </text>
            <text x="520" y="590" fill="rgba(16, 185, 129, 0.45)" fontSize="22" fontWeight="bold" textAnchor="middle">
              Q4 SUDESTE: MAGNETISMO ABISSAL QoL (75 NÓS)
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
                      ? '#00e5ff'
                      : inPreview
                      ? '#facc15'
                      : 'rgba(148, 163, 184, 0.24)'
                  }
                  strokeWidth={bothAllocated ? 4.2 : inPreview ? 3.2 : 1.6}
                />
              );
            })}

            {/* Nó Raiz Central: Núcleo Ancestral */}
            <g transform="translate(0, 0)">
              <circle r={24} fill="#0f172a" stroke="#00e5ff" strokeWidth={4} />
              <circle r={12} fill="#00e5ff" />
              <text y={38} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">
                Núcleo Ancestral
              </text>
            </g>

            {/* Os 300 Nós da Árvore */}
            {treeData.nodes.map((node) => {
              const isAllocated = allocatedSet.has(node.id);
              const isPreview = previewPathSet.has(node.id);
              const matchesSearch =
                !searchQuery.trim() ||
                node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                node.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

              const matchesFilter =
                selectedTagFilter === 'ALL' ||
                (selectedTagFilter === 'KEYSTONE' && node.type === 'keystone') ||
                (selectedTagFilter === 'NOTABLE' && node.type === 'notable') ||
                node.tags.includes(selectedTagFilter);

              const highlighted = matchesSearch && matchesFilter;
              const hasEquippedSynergy = node.tags.some(t => equippedSkillTags.has(t));

              const radius = node.type === 'keystone' ? 18 : node.type === 'notable' ? 12.5 : 8.5;
              const strokeColor = isAllocated
                ? '#ffffff'
                : isPreview
                ? '#facc15'
                : hasEquippedSynergy
                ? node.color
                : 'rgba(148, 163, 184, 0.45)';

              const fillColor = isAllocated
                ? node.color
                : isPreview
                ? 'rgba(250, 204, 21, 0.45)'
                : '#091326';

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  style={{
                    cursor: 'pointer',
                    opacity: highlighted ? 1 : 0.18
                  }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(node);
                  }}
                >
                  {node.type === 'keystone' && (
                    <circle
                      r={radius + 5}
                      fill="none"
                      stroke={isAllocated ? '#facc15' : node.color}
                      strokeWidth={2}
                      strokeDasharray="4 3"
                    />
                  )}
                  <circle
                    r={radius}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isAllocated ? 3.5 : node.type === 'notable' ? 2.5 : 1.5}
                  />
                  {node.type === 'keystone' && (
                    <text y={5} fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                      ★
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Tooltip Detalhado do Nó Selecionado / Sob o Cursor */}
        <div className="passive-node-inspector" onMouseDown={(e) => e.stopPropagation()}>
          {hoveredNode ? (
            <>
              <div className="inspector-header">
                <span
                  className={`inspector-type-badge ${hoveredNode.type}`}
                  style={{ borderColor: hoveredNode.color, color: hoveredNode.color }}
                >
                  {hoveredNode.type === 'keystone'
                    ? '★ CHAVE ANGULAR (KEYSTONE)'
                    : hoveredNode.type === 'notable'
                    ? '◆ NÓ NOTÁVEL'
                    : '● NÓ MENOR'}
                </span>
                <span className="inspector-quad">{hoveredNode.quadrantShortName}</span>
              </div>
              <div className="inspector-name">{hoveredNode.name}</div>
              <div className="inspector-tags">
                {hoveredNode.tags.map((t) => (
                  <span
                    key={t}
                    className={`inspector-tag-pill ${equippedSkillTags.has(t) ? 'synergy-match' : ''}`}
                  >
                    [{t}] {equippedSkillTags.has(t) ? '⚡' : ''}
                  </span>
                ))}
              </div>
              <p className="inspector-desc">{hoveredNode.description}</p>
              <div className="inspector-action-hint">
                {allocatedSet.has(hoveredNode.id) ? (
                  <span style={{ color: '#34d399' }}>
                    ✔ Nó Alocado — Clique para desalocar (se for extremidade da rota)
                  </span>
                ) : previewPath.length <= pointsAvailable && allocatedIds.length + previewPath.length <= 30 ? (
                  <span style={{ color: '#facc15' }}>
                    ⚡ Clique para alocar rota ({previewPath.length} {previewPath.length === 1 ? 'ponto' : 'pontos'})
                  </span>
                ) : (
                  <span style={{ color: '#f87171' }}>
                    🔒 Requer {previewPath.length} pts livres (Disponíveis: {pointsAvailable} | Cap 30/300)
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="inspector-empty">
              Passe o mouse sobre qualquer um dos <strong>300 nós</strong> do grafo para inspecionar seus bônus e rota de conexão, ou clique para alocar.
            </div>
          )}
        </div>
      </div>

      {/* Resumo de Keystones e Bônus Ativos da Árvore */}
      <div className="passive-summary-footer">
        <div className="summary-tags-row">
          {Object.entries(passiveBonuses?.tagMultipliers || {}).map(([tag, mult]) => (
            <div
              key={tag}
              className={`summary-tag-chip ${mult > 1 ? 'boosted' : ''} ${equippedSkillTags.has(tag) ? 'equipped-tag' : ''}`}
            >
              <span>[{tag}]</span>
              <strong>{Math.round(mult * 100)}%</strong>
            </div>
          ))}
        </div>
        {statusMessage && <div className="tree-status-msg">{statusMessage}</div>}
      </div>
    </div>
  );
}
