import { useMemo, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ZZStructure } from '../model/ZZStructure';
import { ZZCellView, GAP_X, GAP_Y } from './ZZCell';
import { ZZEdge, NavigationArrow } from './ZZEdges';
import { DimensionSelector } from './DimensionSelector';

interface Props {
  structure: ZZStructure;
  focusCellId: string;
  hDimension: string;
  vDimension: string;
  selectedCells: Set<string>;
  highlightedRank: string | null;
  onFocusCell: (id: string) => void;
  onSelectCell: (id: string) => void;
  onSetHDimension: (dim: string) => void;
  onSetVDimension: (dim: string) => void;
  onMove: (dir: 'left' | 'right' | 'up' | 'down') => void;
}

const RADIUS = 3;

export function ZZVisualization({
  structure,
  focusCellId,
  hDimension,
  vDimension,
  selectedCells,
  highlightedRank,
  onFocusCell,
  onSelectCell,
  onSetHDimension,
  onSetVDimension,
  onMove,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const dimMetas = useMemo(
    () => Array.from(structure.dimensions.values()),
    [structure]
  );

  const hColor = structure.dimensions.get(hDimension)?.color || '#888';
  const vColor = structure.dimensions.get(vDimension)?.color || '#888';

  // Build the view grid: cells positioned in 2D by their offset from focus
  const viewGrid = useMemo(() => {
    if (!focusCellId) return [];

    const grid: { cellId: string; x: number; y: number }[] = [];
    const seen = new Set<string>();

    // Get horizontal neighbors
    const hNeighbors = structure.getNeighbors(focusCellId, hDimension, RADIUS);
    const focusHIndex = hNeighbors.indexOf(focusCellId);

    for (let hi = 0; hi < hNeighbors.length; hi++) {
      const hCellId = hNeighbors[hi];
      const hOffset = hi - focusHIndex;

      // For each h-neighbor, get vertical neighbors
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

  // Build edges
  const edges = useMemo(() => {
    const edgeList: {
      fromX: number; fromY: number;
      toX: number; toY: number;
      color: string;
      dim: string;
      key: string;
    }[] = [];

    const posMap = new Map<string, { x: number; y: number }>();
    for (const item of viewGrid) {
      posMap.set(item.cellId, { x: item.x, y: item.y });
    }

    for (const item of viewGrid) {
      const cell = structure.cells.get(item.cellId);
      if (!cell) continue;

      // Horizontal edges
      const hPos = cell.posward.get(hDimension);
      if (hPos && posMap.has(hPos)) {
        const to = posMap.get(hPos)!;
        edgeList.push({
          fromX: item.x, fromY: item.y,
          toX: to.x, toY: to.y,
          color: hColor,
          dim: hDimension,
          key: `h-${item.cellId}-${hPos}`,
        });
      }

      // Vertical edges
      const vPos = cell.posward.get(vDimension);
      if (vPos && posMap.has(vPos)) {
        const to = posMap.get(vPos)!;
        edgeList.push({
          fromX: item.x, fromY: item.y,
          toX: to.x, toY: to.y,
          color: vColor,
          dim: vDimension,
          key: `v-${item.cellId}-${vPos}`,
        });
      }
    }

    return edgeList;
  }, [viewGrid, structure, hDimension, vDimension, hColor, vColor]);

  // Get highlighted rank cell IDs
  const highlightedCellIds = useMemo(() => {
    if (!highlightedRank || !focusCellId) return new Set<string>();
    const rank = structure.getRank(focusCellId, highlightedRank);
    return new Set(rank);
  }, [structure, focusCellId, highlightedRank]);

  // Check if there are neighbors to navigate to in each direction
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

          {/* Edges */}
          {edges.map(edge => (
            <ZZEdge
              key={edge.key}
              fromX={edge.fromX}
              fromY={edge.fromY}
              toX={edge.toX}
              toY={edge.toY}
              color={edge.color}
              isHighlighted={highlightedRank === edge.dim}
            />
          ))}

          {/* Cells */}
          <AnimatePresence mode="popLayout">
            {viewGrid.map(item => {
              const cell = structure.cells.get(item.cellId);
              if (!cell) return null;
              return (
                <ZZCellView
                  key={item.cellId}
                  cell={cell}
                  isFocus={item.cellId === focusCellId}
                  isSelected={selectedCells.has(item.cellId)}
                  isInHighlightedRank={highlightedCellIds.has(item.cellId)}
                  dimColor={highlightedRank === hDimension ? hColor : vColor}
                  x={item.x}
                  y={item.y}
                  onClick={() => onFocusCell(item.cellId)}
                  onDoubleClick={() => onSelectCell(item.cellId)}
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
                  {k}: {v}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
