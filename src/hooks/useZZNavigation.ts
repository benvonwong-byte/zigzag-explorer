import { useState, useCallback, useMemo } from 'react';
import { ZZStructure } from '../model/ZZStructure';

export interface ZZNavigationState {
  focusCellId: string;
  hDimension: string; // horizontal axis dimension
  vDimension: string; // vertical axis dimension
  selectedCells: Set<string>;
  highlightedRank: string | null; // dimension name of highlighted rank
  overlayDimensions: Set<string>; // additional dimensions whose edges are shown
}

export function useZZNavigation(structure: ZZStructure) {
  const allDimensions = useMemo(
    () => Array.from(structure.dimensions.keys()),
    [structure]
  );

  const [state, setState] = useState<ZZNavigationState>({
    focusCellId: '',
    hDimension: allDimensions[0] || '',
    vDimension: allDimensions[1] || '',
    selectedCells: new Set<string>(),
    highlightedRank: null,
    overlayDimensions: new Set<string>(),
  });

  const setFocus = useCallback((cellId: string) => {
    setState(prev => ({ ...prev, focusCellId: cellId }));
  }, []);

  const setHDimension = useCallback((dim: string) => {
    setState(prev => {
      if (dim === prev.vDimension) {
        return { ...prev, hDimension: dim, vDimension: prev.hDimension };
      }
      return { ...prev, hDimension: dim };
    });
  }, []);

  const setVDimension = useCallback((dim: string) => {
    setState(prev => {
      if (dim === prev.hDimension) {
        return { ...prev, vDimension: dim, hDimension: prev.vDimension };
      }
      return { ...prev, vDimension: dim };
    });
  }, []);

  const moveFocus = useCallback(
    (direction: 'left' | 'right' | 'up' | 'down') => {
      setState(prev => {
        const cell = structure.cells.get(prev.focusCellId);
        if (!cell) return prev;

        let nextId: string | undefined;
        if (direction === 'right') {
          nextId = cell.posward.get(prev.hDimension);
        } else if (direction === 'left') {
          nextId = cell.negward.get(prev.hDimension);
        } else if (direction === 'down') {
          nextId = cell.posward.get(prev.vDimension);
        } else if (direction === 'up') {
          nextId = cell.negward.get(prev.vDimension);
        }

        return nextId ? { ...prev, focusCellId: nextId } : prev;
      });
    },
    [structure]
  );

  const toggleSelected = useCallback((cellId: string) => {
    setState(prev => {
      const next = new Set(prev.selectedCells);
      if (next.has(cellId)) {
        next.delete(cellId);
      } else {
        next.add(cellId);
      }
      return { ...prev, selectedCells: next };
    });
  }, []);

  const clearSelected = useCallback(() => {
    setState(prev => ({ ...prev, selectedCells: new Set() }));
  }, []);

  const setHighlightedRank = useCallback((dim: string | null) => {
    setState(prev => ({ ...prev, highlightedRank: dim }));
  }, []);

  const toggleOverlayDimension = useCallback((dim: string) => {
    setState(prev => {
      const next = new Set(prev.overlayDimensions);
      if (next.has(dim)) {
        next.delete(dim);
      } else {
        next.add(dim);
      }
      return { ...prev, overlayDimensions: next };
    });
  }, []);

  // Get the 2D neighborhood grid for the current focus
  const getViewGrid = useCallback(
    (radius: number = 3) => {
      const hNeighbors = structure.getNeighbors(
        state.focusCellId,
        state.hDimension,
        radius
      );
      const grid: { cellId: string; x: number; y: number }[] = [];

      const focusHIndex = hNeighbors.indexOf(state.focusCellId);

      for (let hi = 0; hi < hNeighbors.length; hi++) {
        const hCell = hNeighbors[hi];
        const vNeighbors = structure.getNeighbors(
          hCell,
          state.vDimension,
          radius
        );
        const focusVIndex = vNeighbors.indexOf(hCell);

        for (let vi = 0; vi < vNeighbors.length; vi++) {
          grid.push({
            cellId: vNeighbors[vi],
            x: hi - focusHIndex,
            y: vi - focusVIndex,
          });
        }
      }

      // Deduplicate
      const seen = new Set<string>();
      return grid.filter(item => {
        const key = item.cellId;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    [structure, state.focusCellId, state.hDimension, state.vDimension]
  );

  return {
    state,
    allDimensions,
    setFocus,
    setHDimension,
    setVDimension,
    moveFocus,
    toggleSelected,
    clearSelected,
    setHighlightedRank,
    toggleOverlayDimension,
    getViewGrid,
  };
}
