import { useState, useMemo, useCallback } from 'react';
import type { ZZStructure } from '../model/ZZStructure';
import type { PropertyMeta } from '../model/VisualMapping';

export type FilterMode = 'ghost' | 'exclude';

export interface FilterCriterion {
  property: string;
  includedValues: Set<string>;
}

export interface FilterState {
  mode: FilterMode;
  criteria: FilterCriterion[];
}

export function useFiltering(structure: ZZStructure, propertyMetas: PropertyMeta[]) {
  const [state, setState] = useState<FilterState>({
    mode: 'ghost',
    criteria: [],
  });

  const categoricalMetas = useMemo(
    () => propertyMetas.filter(m => m.type === 'categorical' && m.categories),
    [propertyMetas]
  );

  const setMode = useCallback((mode: FilterMode) => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  const toggleValue = useCallback((property: string, value: string) => {
    setState(prev => {
      const existing = prev.criteria.find(c => c.property === property);
      const meta = categoricalMetas.find(m => m.key === property);
      if (!meta?.categories) return prev;

      if (!existing) {
        // First toggle on this property: include all except this one
        const included = new Set(meta.categories.filter(v => v !== value));
        return {
          ...prev,
          criteria: [...prev.criteria, { property, includedValues: included }],
        };
      }

      const next = new Set(existing.includedValues);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }

      // If all values included again, remove the criterion
      if (next.size === meta.categories.length) {
        return {
          ...prev,
          criteria: prev.criteria.filter(c => c.property !== property),
        };
      }

      return {
        ...prev,
        criteria: prev.criteria.map(c =>
          c.property === property ? { ...c, includedValues: next } : c
        ),
      };
    });
  }, [categoricalMetas]);

  const clearAll = useCallback(() => {
    setState(prev => ({ ...prev, criteria: [] }));
  }, []);

  // Compute filtered-out cell IDs (cells that don't match ALL criteria)
  const filteredOutCellIds = useMemo(() => {
    if (state.criteria.length === 0) return new Set<string>();

    const out = new Set<string>();
    const allCells = structure.getAllCells();

    for (const cell of allCells) {
      for (const criterion of state.criteria) {
        const val = String(cell.data.properties[criterion.property] ?? '');
        if (!criterion.includedValues.has(val)) {
          out.add(cell.id);
          break; // AND logic: fail any criterion = filtered out
        }
      }
    }

    return out;
  }, [structure, state.criteria]);

  const activeCount = structure.cells.size - filteredOutCellIds.size;

  return {
    filterState: state,
    filteredOutCellIds,
    activeCount,
    categoricalMetas,
    setMode,
    toggleValue,
    clearAll,
  };
}
