import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ZZStructure } from '../model/ZZStructure';
import { characterMeta } from '../data/starwars';

interface Props {
  structure: ZZStructure;
  focusCellId: string;
  hDimension: string;
  vDimension: string;
  selectedCells: Set<string>;
  overlayDimensions: Set<string>;
  onFocusCell: (id: string) => void;
  onSelectCell: (id: string) => void;
  onHighlightRank: (dim: string | null) => void;
  highlightedRank: string | null;
  onSetHDimension: (dim: string) => void;
  onSetVDimension: (dim: string) => void;
  onToggleOverlay: (dim: string) => void;
}

type TabId = 'ranks' | 'connections' | 'properties' | 'clusters' | 'patterns';

export function DataPanel({
  structure,
  focusCellId,
  hDimension,
  vDimension,
  selectedCells,
  overlayDimensions,
  onFocusCell,
  onSelectCell,
  onHighlightRank,
  highlightedRank,
  onSetHDimension,
  onSetVDimension,
  onToggleOverlay,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('ranks');
  const [expandedDim, setExpandedDim] = useState<string | null>(null);

  const focusCell = structure.cells.get(focusCellId);
  const focusDims = focusCell
    ? Array.from(
        new Set([
          ...Array.from(focusCell.posward.keys()),
          ...Array.from(focusCell.negward.keys()),
        ])
      )
    : [];

  const meta = characterMeta?.get(focusCellId);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'ranks', label: 'Ranks' },
    { id: 'connections', label: 'Links' },
    { id: 'properties', label: 'Props' },
    { id: 'clusters', label: 'Clusters' },
    { id: 'patterns', label: 'Patterns' },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] border-l border-[var(--border-color)]">
      {/* Header with bio */}
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">
          Data Inspector
        </div>
        {focusCell && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{focusCell.data.label}</span>
              {meta?.wookieepediaUrl && (
                <a
                  href={meta.wookieepediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[var(--accent-cyan)] hover:underline shrink-0"
                >
                  Wookieepedia
                </a>
              )}
            </div>
            {meta?.bio && (
              <div className="text-[10px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                {meta.bio}
              </div>
            )}
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-color)]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 text-[11px] uppercase tracking-wider transition-all cursor-pointer"
            style={{
              color: activeTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              background: activeTab === tab.id ? 'rgba(0,229,255,0.04)' : 'transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'ranks' && (
            <RanksTab
              key="ranks"
              structure={structure}
              focusCellId={focusCellId}
              focusDims={focusDims}
              expandedDim={expandedDim}
              setExpandedDim={setExpandedDim}
              onFocusCell={onFocusCell}
              onSelectCell={onSelectCell}
              onHighlightRank={onHighlightRank}
              highlightedRank={highlightedRank}
              selectedCells={selectedCells}
            />
          )}
          {activeTab === 'connections' && (
            <ConnectionsTab
              key="connections"
              structure={structure}
              focusCellId={focusCellId}
              hDimension={hDimension}
              vDimension={vDimension}
              overlayDimensions={overlayDimensions}
              onFocusCell={onFocusCell}
              onSetHDimension={onSetHDimension}
              onSetVDimension={onSetVDimension}
              onToggleOverlay={onToggleOverlay}
            />
          )}
          {activeTab === 'properties' && (
            <PropertiesTab
              key="properties"
              structure={structure}
              focusCellId={focusCellId}
              selectedCells={selectedCells}
            />
          )}
          {activeTab === 'clusters' && (
            <ClustersTab
              key="clusters"
              structure={structure}
              focusCellId={focusCellId}
              hDimension={hDimension}
              vDimension={vDimension}
              onFocusCell={onFocusCell}
            />
          )}
          {activeTab === 'patterns' && (
            <PatternsTab
              key="patterns"
              structure={structure}
              focusCellId={focusCellId}
              hDimension={hDimension}
              vDimension={vDimension}
              onFocusCell={onFocusCell}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Ranks tab - shows all ranks the focus cell belongs to */
function RanksTab({
  structure,
  focusCellId,
  focusDims,
  expandedDim,
  setExpandedDim,
  onFocusCell,
  onSelectCell,
  onHighlightRank,
  highlightedRank,
  selectedCells,
}: {
  structure: ZZStructure;
  focusCellId: string;
  focusDims: string[];
  expandedDim: string | null;
  setExpandedDim: (d: string | null) => void;
  onFocusCell: (id: string) => void;
  onSelectCell: (id: string) => void;
  onHighlightRank: (dim: string | null) => void;
  highlightedRank: string | null;
  selectedCells: Set<string>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-3"
    >
      {focusDims.map(dim => {
        const meta = structure.dimensions.get(dim);
        const rank = structure.getRank(focusCellId, dim);
        const isExpanded = expandedDim === dim;
        const isHighlighted = highlightedRank === dim;
        const focusIndex = rank.indexOf(focusCellId);

        return (
          <div key={dim} className="mb-3">
            <button
              className="w-full flex items-center justify-between py-1.5 px-2 rounded text-left transition-all cursor-pointer hover:bg-[var(--bg-tertiary)]"
              style={{
                borderLeft: `3px solid ${meta?.color || '#888'}`,
              }}
              onClick={() => {
                setExpandedDim(isExpanded ? null : dim);
                onHighlightRank(isHighlighted ? null : dim);
              }}
            >
              <span className="text-[11px] font-medium" style={{ color: meta?.color }}>
                {dim.replace('d.', '')}
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                {rank.length} cells · #{focusIndex + 1}
              </span>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-1 max-h-48 overflow-y-auto">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="text-[var(--text-muted)]">
                          <th className="text-left py-1 px-2 w-8">#</th>
                          <th className="text-left py-1 px-2">Name</th>
                          <th className="text-left py-1 px-2">Info</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rank.map((cellId, i) => {
                          const cell = structure.cells.get(cellId);
                          if (!cell) return null;
                          const isFocus = cellId === focusCellId;
                          const isSelected = selectedCells.has(cellId);
                          return (
                            <tr
                              key={cellId}
                              className="cursor-pointer transition-all hover:bg-[var(--bg-tertiary)]"
                              style={{
                                background: isFocus
                                  ? 'rgba(255,255,255,0.06)'
                                  : isSelected
                                    ? 'rgba(0,229,255,0.06)'
                                    : undefined,
                              }}
                              onClick={() => onFocusCell(cellId)}
                              onDoubleClick={() => onSelectCell(cellId)}
                            >
                              <td className="py-1 px-2 text-[var(--text-muted)]">{i + 1}</td>
                              <td
                                className="py-1 px-2 font-medium"
                                style={{ color: isFocus ? '#fff' : 'var(--text-primary)' }}
                              >
                                {cell.data.label}
                                {isSelected && (
                                  <span className="ml-1 text-[var(--accent-cyan)]">●</span>
                                )}
                              </td>
                              <td className="py-1 px-2 text-[var(--text-muted)]">
                                {String(cell.data.properties.faction ?? cell.data.properties.species ?? '')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </motion.div>
  );
}

/** Connections tab - shows hidden dimension relationships */
function ConnectionsTab({
  structure,
  focusCellId,
  hDimension,
  vDimension,
  overlayDimensions,
  onFocusCell,
  onSetHDimension,
  onSetVDimension,
  onToggleOverlay,
}: {
  structure: ZZStructure;
  focusCellId: string;
  hDimension: string;
  vDimension: string;
  overlayDimensions: Set<string>;
  onFocusCell: (id: string) => void;
  onSetHDimension: (dim: string) => void;
  onSetVDimension: (dim: string) => void;
  onToggleOverlay: (dim: string) => void;
}) {
  const focusCell = structure.cells.get(focusCellId);
  const allDims = Array.from(structure.dimensions.keys());

  // All dimensions excluding current H and V
  const hiddenDims = allDims.filter(d => d !== hDimension && d !== vDimension);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-3"
    >
      <div className="text-[10px] text-[var(--text-muted)] mb-2">
        Hidden dimension connections (not on H/V axes)
      </div>
      {focusCell && hiddenDims.map(dim => {
        const meta = structure.dimensions.get(dim);
        const rank = structure.getRank(focusCellId, dim);
        const focusIndex = rank.indexOf(focusCellId);
        const negNeighbor = focusIndex > 0 ? rank[focusIndex - 1] : null;
        const posNeighbor = focusIndex < rank.length - 1 ? rank[focusIndex + 1] : null;
        const isOverlay = overlayDimensions.has(dim);

        return (
          <div
            key={dim}
            className="mb-2 p-2 rounded border bg-[var(--bg-tertiary)]"
            style={{ borderColor: isOverlay ? meta?.color : 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium" style={{ color: meta?.color }}>
                {dim.replace('d.', '')}
              </span>
              <span className="text-[9px] text-[var(--text-muted)]">
                #{focusIndex + 1} of {rank.length}
              </span>
            </div>

            {/* Neighbor chain */}
            <div className="flex items-center gap-1 mb-2 text-[10px]">
              {negNeighbor ? (
                <button
                  onClick={() => onFocusCell(negNeighbor)}
                  className="px-1.5 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-all cursor-pointer truncate max-w-[80px]"
                >
                  {structure.cells.get(negNeighbor)?.data.label}
                </button>
              ) : (
                <span className="text-[var(--text-muted)] px-1">...</span>
              )}
              <span style={{ color: meta?.color }}>{'<'}</span>
              <span className="px-1.5 py-0.5 rounded border font-medium" style={{ borderColor: meta?.color, color: meta?.color }}>
                {focusCell.data.label.length > 12 ? focusCell.data.label.slice(0, 11) + '...' : focusCell.data.label}
              </span>
              <span style={{ color: meta?.color }}>{'>'}</span>
              {posNeighbor ? (
                <button
                  onClick={() => onFocusCell(posNeighbor)}
                  className="px-1.5 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-all cursor-pointer truncate max-w-[80px]"
                >
                  {structure.cells.get(posNeighbor)?.data.label}
                </button>
              ) : (
                <span className="text-[var(--text-muted)] px-1">...</span>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex gap-1">
              <button
                onClick={() => onSetHDimension(dim)}
                className="text-[9px] px-1.5 py-0.5 rounded border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-all cursor-pointer"
              >
                Use as H
              </button>
              <button
                onClick={() => onSetVDimension(dim)}
                className="text-[9px] px-1.5 py-0.5 rounded border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-all cursor-pointer"
              >
                Use as V
              </button>
              <button
                onClick={() => onToggleOverlay(dim)}
                className="text-[9px] px-1.5 py-0.5 rounded border transition-all cursor-pointer"
                style={{
                  borderColor: isOverlay ? meta?.color : 'var(--border-color)',
                  color: isOverlay ? meta?.color : 'var(--text-muted)',
                  background: isOverlay ? `${meta?.color}12` : 'transparent',
                }}
              >
                {isOverlay ? 'Hide overlay' : 'Show overlay'}
              </button>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

/** Properties tab - comparative table of selected cells */
function PropertiesTab({
  structure,
  focusCellId,
  selectedCells,
}: {
  structure: ZZStructure;
  focusCellId: string;
  selectedCells: Set<string>;
}) {
  const cellIds = useMemo(() => {
    const ids = [focusCellId, ...Array.from(selectedCells)].filter(Boolean);
    return [...new Set(ids)];
  }, [focusCellId, selectedCells]);

  const allKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const id of cellIds) {
      const cell = structure.cells.get(id);
      if (cell) {
        Object.keys(cell.data.properties).forEach(k => keys.add(k));
      }
    }
    return Array.from(keys);
  }, [structure, cellIds]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-3"
    >
      <div className="text-[10px] text-[var(--text-muted)] mb-2">
        {cellIds.length === 1
          ? 'Double-click cells to compare'
          : `Comparing ${cellIds.length} cells`}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr>
              <th className="text-left py-1.5 px-2 text-[var(--text-muted)] border-b border-[var(--border-color)] sticky left-0 bg-[var(--bg-secondary)]">
                Property
              </th>
              {cellIds.map(id => {
                const cell = structure.cells.get(id);
                return (
                  <th
                    key={id}
                    className="text-left py-1.5 px-2 border-b border-[var(--border-color)] min-w-[100px]"
                    style={{ color: id === focusCellId ? '#fff' : 'var(--text-primary)' }}
                  >
                    {cell?.data.label || id}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {allKeys.map(key => {
              const values = cellIds.map(id => {
                const val = structure.cells.get(id)?.data.properties[key];
                return val !== null && val !== undefined ? String(val) : '—';
              });
              const allSame = values.every(v => v === values[0]);
              return (
                <tr key={key}>
                  <td className="py-1 px-2 text-[var(--text-muted)] border-b border-[var(--border-color)] sticky left-0 bg-[var(--bg-secondary)]">
                    {key}
                  </td>
                  {values.map((val, i) => (
                    <td
                      key={i}
                      className="py-1 px-2 border-b border-[var(--border-color)]"
                      style={{
                        color: allSame && cellIds.length > 1 ? 'var(--accent-green)' : 'var(--text-primary)',
                        background: allSame && cellIds.length > 1 ? 'rgba(105,240,174,0.04)' : undefined,
                      }}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

/** Clusters tab - groups cells by shared properties */
function ClustersTab({
  structure,
  focusCellId,
  hDimension,
  vDimension,
  onFocusCell,
}: {
  structure: ZZStructure;
  focusCellId: string;
  hDimension: string;
  vDimension: string;
  onFocusCell: (id: string) => void;
}) {
  const hMeta = structure.dimensions.get(hDimension);
  const vMeta = structure.dimensions.get(vDimension);

  const crossTab = useMemo(() => {
    const allCells = structure.getAllCells();
    const hProp = hDimension.replace('d.', '');
    const vProp = vDimension.replace('d.', '');
    const hValues = new Set<string>();
    const vValues = new Set<string>();
    const countMap = new Map<string, { count: number; cellIds: string[] }>();

    for (const cell of allCells) {
      const hVal = String(cell.data.properties[hProp] ?? 'Unknown');
      const vVal = String(cell.data.properties[vProp] ?? 'Unknown');
      hValues.add(hVal);
      vValues.add(vVal);
      const key = `${hVal}|${vVal}`;
      if (!countMap.has(key)) countMap.set(key, { count: 0, cellIds: [] });
      const entry = countMap.get(key)!;
      entry.count++;
      entry.cellIds.push(cell.id);
    }

    return {
      hValues: Array.from(hValues).sort(),
      vValues: Array.from(vValues).sort(),
      countMap,
      hProp,
      vProp,
    };
  }, [structure, hDimension, vDimension]);

  const maxH = 8;
  const maxV = 10;
  const displayH = crossTab.hValues.slice(0, maxH);
  const displayV = crossTab.vValues.slice(0, maxV);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-3"
    >
      <div className="text-[10px] text-[var(--text-muted)] mb-2">
        Cross-tabulation:{' '}
        <span style={{ color: hMeta?.color }}>{crossTab.hProp}</span>
        {' x '}
        <span style={{ color: vMeta?.color }}>{crossTab.vProp}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="text-[9px] border-collapse">
          <thead>
            <tr>
              <th className="py-1 px-1.5 text-[var(--text-muted)] border-b border-r border-[var(--border-color)]">
                {crossTab.vProp} / {crossTab.hProp}
              </th>
              {displayH.map(h => (
                <th
                  key={h}
                  className="py-1 px-1.5 border-b border-[var(--border-color)] max-w-[60px] truncate"
                  style={{ color: hMeta?.color }}
                  title={h}
                >
                  {h.length > 8 ? h.slice(0, 7) + '...' : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayV.map(v => (
              <tr key={v}>
                <td
                  className="py-1 px-1.5 border-r border-b border-[var(--border-color)] max-w-[80px] truncate"
                  style={{ color: vMeta?.color }}
                  title={v}
                >
                  {v.length > 10 ? v.slice(0, 9) + '...' : v}
                </td>
                {displayH.map(h => {
                  const entry = crossTab.countMap.get(`${h}|${v}`);
                  const count = entry?.count || 0;
                  const maxCount = Math.max(
                    ...Array.from(crossTab.countMap.values()).map(e => e.count)
                  );
                  const intensity = count > 0 ? Math.max(0.15, count / maxCount) : 0;
                  return (
                    <td
                      key={h}
                      className="py-1 px-1.5 text-center border-b border-[var(--border-color)] cursor-pointer transition-all"
                      style={{
                        background: count > 0 ? `rgba(0,229,255,${intensity * 0.3})` : undefined,
                        color: count > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                      }}
                      onClick={() => {
                        if (entry?.cellIds[0]) onFocusCell(entry.cellIds[0]);
                      }}
                      title={entry?.cellIds.map(id => structure.cells.get(id)?.data.label).join(', ')}
                    >
                      {count || '.'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

/** Patterns tab - surfaces interesting patterns about the focus cell */
function PatternsTab({
  structure,
  focusCellId,
  hDimension,
  vDimension,
  onFocusCell,
}: {
  structure: ZZStructure;
  focusCellId: string;
  hDimension: string;
  vDimension: string;
  onFocusCell: (id: string) => void;
}) {
  const patterns = useMemo(() => {
    const cell = structure.cells.get(focusCellId);
    if (!cell) return [];

    const results: {
      type: string;
      title: string;
      description: string;
      color: string;
      relatedCells: string[];
    }[] = [];

    const dims = structure.getCellDimensions(focusCellId);
    const allDims = Array.from(structure.dimensions.keys());

    // 1. Dimension participation
    const missingDims = allDims.filter(d => !dims.includes(d));
    if (missingDims.length > 0) {
      results.push({
        type: 'missing',
        title: 'Missing Dimensions',
        description: `Not connected along: ${missingDims.map(d => d.replace('d.', '')).join(', ')}`,
        color: 'var(--accent-orange)',
        relatedCells: [],
      });
    }

    // 2. Find cells that share the most ranks (structural siblings)
    const allCells = structure.getAllCells();
    let maxShared = 0;
    let mostSimilar: string[] = [];

    for (const other of allCells) {
      if (other.id === focusCellId) continue;
      let shared = 0;
      for (const dim of allDims) {
        const myRank = structure.getRank(focusCellId, dim);
        const theirRank = structure.getRank(other.id, dim);
        if (myRank.length > 1 && theirRank.length > 1) {
          const myRankHead = myRank[0];
          const theirRankHead = theirRank[0];
          if (myRankHead === theirRankHead) shared++;
        }
      }
      if (shared > maxShared) {
        maxShared = shared;
        mostSimilar = [other.id];
      } else if (shared === maxShared && shared > 0) {
        mostSimilar.push(other.id);
      }
    }

    if (mostSimilar.length > 0) {
      const names = mostSimilar
        .slice(0, 5)
        .map(id => structure.cells.get(id)?.data.label)
        .join(', ');
      results.push({
        type: 'similar',
        title: `Most Similar (${maxShared} shared ranks)`,
        description: names + (mostSimilar.length > 5 ? ` +${mostSimilar.length - 5} more` : ''),
        color: 'var(--accent-green)',
        relatedCells: mostSimilar.slice(0, 5),
      });
    }

    // 3. Rank sizes — notable small or large ranks
    for (const dim of dims) {
      const rank = structure.getRank(focusCellId, dim);
      const meta = structure.dimensions.get(dim);
      if (rank.length <= 2) {
        results.push({
          type: 'small-rank',
          title: `Small ${dim.replace('d.', '')} Rank`,
          description: `Only ${rank.length} cell${rank.length === 1 ? '' : 's'} in this rank`,
          color: meta?.color || '#888',
          relatedCells: rank.filter(id => id !== focusCellId),
        });
      } else if (rank.length > 20) {
        results.push({
          type: 'large-rank',
          title: `Large ${dim.replace('d.', '')} Rank`,
          description: `${rank.length} cells — dominant group`,
          color: meta?.color || '#888',
          relatedCells: [],
        });
      }
    }

    // 4. Recommended groupings — categorical properties where focus has a rare value
    const props = cell.data.properties;
    const categoricalKeys = Object.keys(props).filter(k => typeof props[k] === 'string');
    for (const key of categoricalKeys) {
      const val = String(props[key]);
      let count = 0;
      for (const other of allCells) {
        if (String(other.data.properties[key]) === val) count++;
      }
      const percentage = count / allCells.length;
      if (percentage < 0.1 && count > 1) {
        results.push({
          type: 'rare-group',
          title: `Rare ${key}: "${val}"`,
          description: `Only ${count} of ${allCells.length} cells (${(percentage * 100).toFixed(0)}%) — try grouping by ${key}`,
          color: 'var(--accent-purple)',
          relatedCells: [],
        });
      }
    }

    // 5. Outlier numeric properties vs rankmates
    const numericKeys = Object.keys(props).filter(k => typeof props[k] === 'number');
    const activeDims = [hDimension, vDimension];
    for (const dim of activeDims) {
      const rank = structure.getRank(focusCellId, dim);
      if (rank.length < 3) continue;
      const dimMeta = structure.dimensions.get(dim);

      for (const key of numericKeys) {
        const myVal = props[key] as number;
        const rankVals = rank
          .map(id => structure.cells.get(id)?.data.properties[key])
          .filter((v): v is number => typeof v === 'number');
        if (rankVals.length < 3) continue;

        const avg = rankVals.reduce((a, b) => a + b, 0) / rankVals.length;
        const isHighest = myVal >= Math.max(...rankVals);
        const isLowest = myVal <= Math.min(...rankVals);

        if (isHighest && myVal > avg * 1.5) {
          results.push({
            type: 'outlier-high',
            title: `Highest ${key} in ${dim.replace('d.', '')} rank`,
            description: `${myVal} vs avg ${avg.toFixed(1)}`,
            color: dimMeta?.color || '#888',
            relatedCells: [],
          });
        } else if (isLowest && myVal < avg * 0.5) {
          results.push({
            type: 'outlier-low',
            title: `Lowest ${key} in ${dim.replace('d.', '')} rank`,
            description: `${myVal} vs avg ${avg.toFixed(1)}`,
            color: dimMeta?.color || '#888',
            relatedCells: [],
          });
        }
      }
    }

    // 6. Unique property combinations
    let uniqueCount = 0;
    for (const other of allCells) {
      if (other.id === focusCellId) continue;
      let allMatch = true;
      for (const [k, v] of Object.entries(props)) {
        if (String(other.data.properties[k] ?? '') !== String(v ?? '')) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) uniqueCount++;
    }
    if (uniqueCount === 0) {
      results.push({
        type: 'unique',
        title: 'Unique Profile',
        description: 'No other cell shares all the same properties',
        color: 'var(--accent-purple)',
        relatedCells: [],
      });
    }

    return results;
  }, [structure, focusCellId, hDimension, vDimension]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-3"
    >
      {patterns.length === 0 ? (
        <div className="text-[11px] text-[var(--text-muted)] py-4 text-center">
          Select a cell to discover patterns
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {patterns.map((p, i) => (
            <motion.div
              key={`${p.type}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-2.5 rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)]"
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: p.color }}
                />
                <span className="text-[11px] font-medium" style={{ color: p.color }}>
                  {p.title}
                </span>
              </div>
              <div className="text-[10px] text-[var(--text-secondary)] mb-1.5">
                {p.description}
              </div>
              {p.relatedCells.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {p.relatedCells.map(id => {
                    const c = structure.cells.get(id);
                    return (
                      <button
                        key={id}
                        onClick={() => onFocusCell(id)}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--accent-cyan)] hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer"
                      >
                        {c?.data.label || id}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
