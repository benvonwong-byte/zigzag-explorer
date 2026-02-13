import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FilterState, FilterMode } from '../hooks/useFiltering';
import type { PropertyMeta } from '../model/VisualMapping';

interface Props {
  filterState: FilterState;
  filteredOutCount: number;
  totalCount: number;
  categoricalMetas: PropertyMeta[];
  onSetMode: (mode: FilterMode) => void;
  onToggleValue: (property: string, value: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export function FilterPanel({
  filterState,
  filteredOutCount,
  totalCount,
  categoricalMetas,
  onSetMode,
  onToggleValue,
  onClearAll,
  onClose,
}: Props) {
  const [expandedProp, setExpandedProp] = useState<string | null>(null);
  const activeCount = totalCount - filteredOutCount;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="absolute top-0 left-0 bottom-0 w-[260px] bg-[var(--bg-secondary)] border-r border-[var(--border-color)] overflow-y-auto z-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border-color)]">
        <span className="text-[11px] uppercase tracking-widest text-[var(--text-muted)]">Filters</span>
        <button
          onClick={onClose}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm cursor-pointer"
        >
          x
        </button>
      </div>

      <div className="p-3">
        {/* Mode toggle */}
        <div className="flex gap-1 mb-3">
          {(['ghost', 'exclude'] as FilterMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => onSetMode(mode)}
              className="flex-1 py-1.5 text-[10px] uppercase tracking-wider rounded border transition-all cursor-pointer"
              style={{
                borderColor: filterState.mode === mode ? 'var(--accent-cyan)' : 'var(--border-color)',
                color: filterState.mode === mode ? 'var(--accent-cyan)' : 'var(--text-muted)',
                background: filterState.mode === mode ? 'rgba(0,229,255,0.06)' : 'transparent',
              }}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="text-[10px] text-[var(--text-muted)] mb-3 flex items-center justify-between">
          <span>
            Showing <span className="text-[var(--text-primary)]">{activeCount}</span> of {totalCount} cells
          </span>
          {filterState.criteria.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[var(--accent-red)] hover:underline cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Property sections */}
        {categoricalMetas.map(meta => {
          if (!meta.categories || meta.categories.length < 2) return null;
          const criterion = filterState.criteria.find(c => c.property === meta.key);
          const isExpanded = expandedProp === meta.key;
          const hasFilter = !!criterion;

          return (
            <div key={meta.key} className="mb-2">
              <button
                onClick={() => setExpandedProp(isExpanded ? null : meta.key)}
                className="w-full flex items-center justify-between py-1.5 px-2 rounded text-left transition-all cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                <span
                  className="text-[11px] font-medium"
                  style={{ color: hasFilter ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}
                >
                  {meta.key}
                </span>
                <span className="text-[9px] text-[var(--text-muted)]">
                  {hasFilter && (
                    <span className="text-[var(--accent-cyan)] mr-1">
                      {criterion!.includedValues.size}/{meta.categories.length}
                    </span>
                  )}
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="px-2 py-1.5 flex flex-wrap gap-1">
                      {meta.categories.map(val => {
                        const isIncluded = !criterion || criterion.includedValues.has(val);
                        return (
                          <button
                            key={val}
                            onClick={() => onToggleValue(meta.key, val)}
                            className="text-[9px] px-1.5 py-0.5 rounded border transition-all cursor-pointer"
                            style={{
                              borderColor: isIncluded ? 'var(--border-color)' : 'var(--accent-red)',
                              color: isIncluded ? 'var(--text-secondary)' : 'var(--text-muted)',
                              background: isIncluded ? 'var(--bg-tertiary)' : 'rgba(255,82,82,0.08)',
                              opacity: isIncluded ? 1 : 0.5,
                              textDecoration: isIncluded ? 'none' : 'line-through',
                            }}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
