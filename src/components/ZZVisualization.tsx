import { useMemo, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as d3 from 'd3';
import type { ZZStructure, CellData } from '../model/ZZStructure';
import { ZZCellView, GAP_X, GAP_Y, CELL_W, CELL_H } from './ZZCell';
import { ZZEdge, NavigationArrow } from './ZZEdges';
import { DimensionSelector } from './DimensionSelector';
import type { ResolvedCellVisuals, ResolvedEdgeVisuals, GroupingConfig } from '../model/VisualMapping';

interface Props {
  structure: ZZStructure;
  focusCellId: string;
  hDimension: string;
  vDimension: string;
  selectedCells: Set<string>;
  highlightedRank: string | null;
  overlayDimensions: Set<string>;
  filteredOutCellIds?: Set<string>;
  filterMode?: 'ghost' | 'exclude';
  onFocusCell: (id: string) => void;
  onSelectCell: (id: string) => void;
  onSetHDimension: (dim: string) => void;
  onSetVDimension: (dim: string) => void;
  onMove: (dir: 'left' | 'right' | 'up' | 'down') => void;
  onToggleOverlay: (dim: string) => void;
  resolveCellVisuals?: (cellData: CellData) => ResolvedCellVisuals;
  resolveEdgeVisuals?: (fromData: CellData, toData: CellData, dimName: string) => ResolvedEdgeVisuals;
  groupingConfig?: GroupingConfig;
}

const RADIUS = 3;
const GROUPING_COLORS = d3.schemeTableau10;

export function ZZVisualization({
  structure,
  focusCellId,
  hDimension,
  vDimension,
  selectedCells,
  highlightedRank,
  overlayDimensions,
  filteredOutCellIds,
  filterMode,
  onFocusCell,
  onSelectCell,
  onSetHDimension,
  onSetVDimension,
  onMove,
  onToggleOverlay,
  resolveCellVisuals,
  resolveEdgeVisuals,
  groupingConfig,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const dimMetas = useMemo(
    () => Array.from(structure.dimensions.values()),
    [structure]
  );

  const hColor = structure.dimensions.get(hDimension)?.color || '#888';
  const vColor = structure.dimensions.get(vDimension)?.color || '#888';

  // Build the view grid
  const viewGrid = useMemo(() => {
    if (!focusCellId) return [];

    const grid: { cellId: string; x: number; y: number }[] = [];
    const seen = new Set<string>();

    const hNeighbors = structure.getNeighbors(focusCellId, hDimension, RADIUS);
    const focusHIndex = hNeighbors.indexOf(focusCellId);

    for (let hi = 0; hi < hNeighbors.length; hi++) {
      const hCellId = hNeighbors[hi];
      const hOffset = hi - focusHIndex;

      const vNeighbors = structure.getNeighbors(hCellId, vDimension, RADIUS);
      const focusVIndex = vNeighbors.indexOf(hCellId);

      for (let vi = 0; vi < vNeighbors.length; vi++) {
        const vCellId = vNeighbors[vi];
        if (seen.has(vCellId)) continue;
        seen.add(vCellId);
        grid.push({
          cellId: vCellId,
          x: hOffset,
          y: vi - focusVIndex,
        });
      }
    }

    return grid;
  }, [structure, focusCellId, hDimension, vDimension]);

  // Build edges (primary H/V + overlay dimensions)
  const edges = useMemo(() => {
    const edgeList: {
      fromX: number; fromY: number;
      toX: number; toY: number;
      color: string;
      dim: string;
      key: string;
      isOverlay: boolean;
      overlayIndex: number;
      edgeVisuals?: ResolvedEdgeVisuals;
    }[] = [];

    const posMap = new Map<string, { x: number; y: number }>();
    for (const item of viewGrid) {
      posMap.set(item.cellId, { x: item.x, y: item.y });
    }

    function addDimensionEdges(dimName: string, color: string, isOverlay: boolean, overlayIndex: number) {
      for (const item of viewGrid) {
        const cell = structure.cells.get(item.cellId);
        if (!cell) continue;
        const posNeighbor = cell.posward.get(dimName);
        if (posNeighbor && posMap.has(posNeighbor)) {
          const to = posMap.get(posNeighbor)!;
          const toCell = structure.cells.get(posNeighbor);
          edgeList.push({
            fromX: item.x, fromY: item.y,
            toX: to.x, toY: to.y,
            color,
            dim: dimName,
            key: `${isOverlay ? 'o' : dimName === hDimension ? 'h' : 'v'}-${dimName}-${item.cellId}-${posNeighbor}`,
            isOverlay,
            overlayIndex,
            edgeVisuals: resolveEdgeVisuals && toCell
              ? resolveEdgeVisuals(cell.data, toCell.data, dimName)
              : undefined,
          });
        }
      }
    }

    // Primary edges
    addDimensionEdges(hDimension, hColor, false, 0);
    addDimensionEdges(vDimension, vColor, false, 0);

    // Overlay edges
    let oIdx = 0;
    for (const dim of overlayDimensions) {
      if (dim === hDimension || dim === vDimension) continue;
      const dimColor = structure.dimensions.get(dim)?.color || '#888';
      addDimensionEdges(dim, dimColor, true, oIdx);
      oIdx++;
    }

    return edgeList;
  }, [viewGrid, structure, hDimension, vDimension, hColor, vColor, overlayDimensions, resolveEdgeVisuals]);

  // Get highlighted rank cell IDs
  const highlightedCellIds = useMemo(() => {
    if (!highlightedRank || !focusCellId) return new Set<string>();
    const rank = structure.getRank(focusCellId, highlightedRank);
    return new Set(rank);
  }, [structure, focusCellId, highlightedRank]);

  // Compute grouping regions
  const groupRegions = useMemo(() => {
    if (!groupingConfig?.enabled || !groupingConfig.property) return [];

    const prop = groupingConfig.property;
    const groups = new Map<string, { x: number; y: number }[]>();

    for (const item of viewGrid) {
      const cell = structure.cells.get(item.cellId);
      if (!cell) continue;
      const val = cell.data.properties[prop];
      const key = String(val ?? 'Unknown');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push({ x: item.x, y: item.y });
    }

    const regions: {
      value: string;
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
    }[] = [];

    const sortedKeys = Array.from(groups.keys()).sort();
    for (let i = 0; i < sortedKeys.length; i++) {
      const key = sortedKeys[i];
      const points = groups.get(key)!;
      if (points.length < 1) continue;

      const pad = 8;
      const minX = Math.min(...points.map(p => p.x)) * GAP_X - CELL_W / 2 - pad;
      const maxX = Math.max(...points.map(p => p.x)) * GAP_X + CELL_W / 2 + pad;
      const minY = Math.min(...points.map(p => p.y)) * GAP_Y - CELL_H / 2 - pad;
      const maxY = Math.max(...points.map(p => p.y)) * GAP_Y + CELL_H / 2 + pad;

      regions.push({
        value: key,
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        color: GROUPING_COLORS[i % GROUPING_COLORS.length],
      });
    }

    return regions;
  }, [viewGrid, structure, groupingConfig]);

  // Check navigation directions
  const canMove = useMemo(() => {
    const cell = structure.cells.get(focusCellId);
    if (!cell) return { left: false, right: false, up: false, down: false };
    return {
      left: cell.negward.has(hDimension),
      right: cell.posward.has(hDimension),
      up: cell.negward.has(vDimension),
      down: cell.posward.has(vDimension),
    };
  }, [structure, focusCellId, hDimension, vDimension]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case 'ArrowRight': e.preventDefault(); onMove('right'); break;
        case 'ArrowLeft': e.preventDefault(); onMove('left'); break;
        case 'ArrowUp': e.preventDefault(); onMove('up'); break;
        case 'ArrowDown': e.preventDefault(); onMove('down'); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onMove]);

  // SVG viewBox centered on focus
  const padding = 80;
  const viewW = (RADIUS * 2 + 1) * GAP_X + padding * 2;
  const viewH = (RADIUS * 2 + 1) * GAP_Y + padding * 2;
  const viewBox = `${-viewW / 2} ${-viewH / 2} ${viewW} ${viewH}`;

  // Available overlay dimensions (exclude H and V)
  const overlayOptions = dimMetas.filter(
    d => d.name !== hDimension && d.name !== vDimension
  );

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      {/* Dimension selectors */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="flex flex-col gap-1.5">
          <DimensionSelector
            dimensions={dimMetas}
            activeDimension={hDimension}
            axis="H"
            onSelect={onSetHDimension}
          />
          <DimensionSelector
            dimensions={dimMetas}
            activeDimension={vDimension}
            axis="V"
            onSelect={onSetVDimension}
          />
          {/* Overlay dimension checkboxes */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mr-1 w-3 shrink-0">+</span>
            {overlayOptions.map(dim => {
              const active = overlayDimensions.has(dim.name);
              return (
                <button
                  key={dim.name}
                  onClick={() => onToggleOverlay(dim.name)}
                  className="text-[9px] px-1.5 py-0.5 rounded border transition-all cursor-pointer"
                  style={{
                    borderColor: active ? dim.color : 'var(--border-color)',
                    color: active ? dim.color : 'var(--text-muted)',
                    background: active ? `${dim.color}12` : 'transparent',
                  }}
                >
                  {dim.name.replace('d.', '')}
                </button>
              );
            })}
          </div>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
          ← → ↑ ↓ to navigate
        </div>
      </div>

      {/* Visualization canvas */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          width="100%"
          height="100%"
          viewBox={viewBox}
          className="select-none"
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Axis lines */}
          <line
            x1={-viewW / 2}
            y1={0}
            x2={viewW / 2}
            y2={0}
            stroke={hColor}
            strokeWidth={0.5}
            opacity={0.15}
            strokeDasharray="4 4"
          />
          <line
            x1={0}
            y1={-viewH / 2}
            x2={0}
            y2={viewH / 2}
            stroke={vColor}
            strokeWidth={0.5}
            opacity={0.15}
            strokeDasharray="4 4"
          />

          {/* Axis labels */}
          <text x={viewW / 2 - 80} y={-8} fill={hColor} fontSize={10} opacity={0.5} fontFamily="'JetBrains Mono', monospace">
            {hDimension.replace('d.', '')} →
          </text>
          <text x={8} y={-viewH / 2 + 20} fill={vColor} fontSize={10} opacity={0.5} fontFamily="'JetBrains Mono', monospace">
            ↓ {vDimension.replace('d.', '')}
          </text>

          {/* Grouping regions */}
          <AnimatePresence>
            {groupRegions.map(region => (
              <motion.g
                key={region.value}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <rect
                  x={region.x}
                  y={region.y}
                  width={region.width}
                  height={region.height}
                  rx={10}
                  fill={region.color}
                  opacity={groupingConfig?.opacity ?? 0.08}
                  stroke={region.color}
                  strokeWidth={1}
                  strokeOpacity={(groupingConfig?.opacity ?? 0.08) * 2.5}
                />
                {groupingConfig?.showLabels && (
                  <text
                    x={region.x + 6}
                    y={region.y + 14}
                    fill={region.color}
                    fontSize={9}
                    opacity={0.6}
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    {region.value}
                  </text>
                )}
              </motion.g>
            ))}
          </AnimatePresence>

          {/* Edges (primary + overlay) */}
          {edges.map(edge => (
            <ZZEdge
              key={edge.key}
              fromX={edge.fromX}
              fromY={edge.fromY}
              toX={edge.toX}
              toY={edge.toY}
              color={edge.color}
              isHighlighted={highlightedRank === edge.dim}
              edgeKey={edge.key}
              visualEncoding={edge.edgeVisuals}
              isOverlay={edge.isOverlay}
              overlayIndex={edge.overlayIndex}
            />
          ))}

          {/* Cells */}
          <AnimatePresence mode="popLayout">
            {viewGrid.map(item => {
              const cell = structure.cells.get(item.cellId);
              if (!cell) return null;
              const cellVisuals = resolveCellVisuals
                ? resolveCellVisuals(cell.data)
                : undefined;
              const isGhosted = filterMode === 'ghost' && filteredOutCellIds?.has(item.cellId);
              return (
                <ZZCellView
                  key={item.cellId}
                  cell={cell}
                  isFocus={item.cellId === focusCellId}
                  isSelected={selectedCells.has(item.cellId)}
                  isInHighlightedRank={highlightedCellIds.has(item.cellId)}
                  isGhosted={isGhosted}
                  dimColor={highlightedRank === hDimension ? hColor : vColor}
                  x={item.x}
                  y={item.y}
                  onClick={() => onFocusCell(item.cellId)}
                  onDoubleClick={() => onSelectCell(item.cellId)}
                  visualEncoding={cellVisuals}
                />
              );
            })}
          </AnimatePresence>

          {/* Navigation arrows */}
          {canMove.right && (
            <NavigationArrow
              x={RADIUS + 1}
              y={0}
              direction="right"
              color={hColor}
              onClick={() => onMove('right')}
              label={`Next along ${hDimension}`}
            />
          )}
          {canMove.left && (
            <NavigationArrow
              x={-(RADIUS + 1)}
              y={0}
              direction="left"
              color={hColor}
              onClick={() => onMove('left')}
              label={`Previous along ${hDimension}`}
            />
          )}
          {canMove.down && (
            <NavigationArrow
              x={0}
              y={RADIUS + 1}
              direction="down"
              color={vColor}
              onClick={() => onMove('down')}
              label={`Next along ${vDimension}`}
            />
          )}
          {canMove.up && (
            <NavigationArrow
              x={0}
              y={-(RADIUS + 1)}
              direction="up"
              color={vColor}
              onClick={() => onMove('up')}
              label={`Previous along ${vDimension}`}
            />
          )}
        </svg>

        {/* Focus cell detail overlay */}
        {focusCellId && structure.cells.get(focusCellId) && (
          <motion.div
            key={focusCellId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-4 py-3 max-w-xs"
          >
            <div className="text-sm font-semibold mb-1">
              {structure.cells.get(focusCellId)!.data.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(structure.cells.get(focusCellId)!.data.properties).map(([k, v]) => (
                <span
                  key={k}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--text-secondary)]"
                >
                  {k}: {String(v ?? '—')}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
