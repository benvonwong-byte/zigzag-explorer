import { useMemo, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ZZVisualization } from './components/ZZVisualization';
import { DataPanel } from './components/DataPanel';
import { SearchBar } from './components/SearchBar';
import { VisualControls } from './components/VisualControls';
import { FilterPanel } from './components/FilterPanel';
import { useZZNavigation } from './hooks/useZZNavigation';
import { useVisualEncoding } from './hooks/useVisualEncoding';
import { useFiltering } from './hooks/useFiltering';
import { buildStarWarsStructure } from './data/starwars';

function App() {
  const structure = useMemo(() => buildStarWarsStructure(), []);

  const {
    state,
    setFocus,
    setHDimension,
    setVDimension,
    moveFocus,
    toggleSelected,
    clearSelected,
    setHighlightedRank,
    toggleOverlayDimension,
  } = useZZNavigation(structure);

  const {
    config: visualConfig,
    propertyMetas,
    resolveCellVisuals,
    resolveEdgeVisuals,
    setCellFill,
    setCellSize,
    setCellOpacity,
    setCellBorder,
    setCellShape,
    setEdgeDash,
    setEdgeThickness,
    setEdgeAnimation,
    setGrouping,
  } = useVisualEncoding(structure);

  const {
    filterState,
    filteredOutCellIds,
    activeCount,
    categoricalMetas: filterMetas,
    setMode: setFilterMode,
    toggleValue: toggleFilterValue,
    clearAll: clearFilters,
  } = useFiltering(structure, propertyMetas);

  const [showVisualControls, setShowVisualControls] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Set initial focus to Luke Skywalker
  useEffect(() => {
    if (!state.focusCellId) {
      const luke = structure.cells.get('luke');
      if (luke) {
        setFocus(luke.id);
      } else {
        const first = structure.getAllCells()[0];
        if (first) setFocus(first.id);
      }
    }
  }, [structure, state.focusCellId, setFocus]);

  // Set initial dimensions
  useEffect(() => {
    if (state.hDimension === '' || state.vDimension === '') {
      setHDimension('d.faction');
      setVDimension('d.species');
    }
  }, [state.hDimension, state.vDimension, setHDimension, setVDimension]);

  if (!state.focusCellId) return null;

  const hasActiveFilters = filterState.criteria.length > 0;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold tracking-wide">
            <span className="text-[var(--accent-cyan)]">ZZ</span>
            <span className="text-[var(--text-secondary)]">Explorer</span>
          </h1>
          <span className="text-[10px] text-[var(--text-muted)] border-l border-[var(--border-color)] pl-3">
            Star Wars Universe · {activeCount}/{structure.cells.size} cells · {structure.dimensions.size} dimensions
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowFilters(v => !v); setShowVisualControls(false); }}
            className="text-[11px] px-2.5 py-1.5 rounded border transition-all cursor-pointer"
            style={{
              borderColor: showFilters || hasActiveFilters ? 'var(--accent-orange)' : 'var(--border-color)',
              color: showFilters || hasActiveFilters ? 'var(--accent-orange)' : 'var(--text-muted)',
              background: showFilters ? 'rgba(255,171,64,0.06)' : hasActiveFilters ? 'rgba(255,171,64,0.04)' : 'var(--bg-tertiary)',
            }}
          >
            Filters{hasActiveFilters ? ` (${filterState.criteria.length})` : ''}
          </button>
          <button
            onClick={() => { setShowVisualControls(v => !v); setShowFilters(false); }}
            className="text-[11px] px-2.5 py-1.5 rounded border transition-all cursor-pointer"
            style={{
              borderColor: showVisualControls ? 'var(--accent-cyan)' : 'var(--border-color)',
              color: showVisualControls ? 'var(--accent-cyan)' : 'var(--text-muted)',
              background: showVisualControls ? 'rgba(0,229,255,0.06)' : 'var(--bg-tertiary)',
            }}
          >
            Visual Encoding
          </button>
          <SearchBar structure={structure} onSelectCell={setFocus} />
          {state.selectedCells.size > 0 && (
            <button
              onClick={clearSelected}
              className="text-[10px] px-2 py-1 rounded border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--accent-red)] hover:border-[var(--accent-red)] transition-all cursor-pointer"
            >
              Clear {state.selectedCells.size} selected
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Left: ZigZag Visualization */}
        <div className="flex-[3] min-w-0 relative">
          <ZZVisualization
            structure={structure}
            focusCellId={state.focusCellId}
            hDimension={state.hDimension}
            vDimension={state.vDimension}
            selectedCells={state.selectedCells}
            highlightedRank={state.highlightedRank}
            overlayDimensions={state.overlayDimensions}
            filteredOutCellIds={hasActiveFilters ? filteredOutCellIds : undefined}
            filterMode={hasActiveFilters ? filterState.mode : undefined}
            onFocusCell={setFocus}
            onSelectCell={toggleSelected}
            onSetHDimension={setHDimension}
            onSetVDimension={setVDimension}
            onMove={moveFocus}
            onToggleOverlay={toggleOverlayDimension}
            resolveCellVisuals={resolveCellVisuals}
            resolveEdgeVisuals={resolveEdgeVisuals}
            groupingConfig={visualConfig.grouping}
          />
          <AnimatePresence>
            {showVisualControls && (
              <VisualControls
                config={visualConfig}
                propertyMetas={propertyMetas}
                overlayDimensions={state.overlayDimensions}
                onSetCellFill={setCellFill}
                onSetCellSize={setCellSize}
                onSetCellOpacity={setCellOpacity}
                onSetCellBorder={setCellBorder}
                onSetCellShape={setCellShape}
                onSetEdgeDash={setEdgeDash}
                onSetEdgeThickness={setEdgeThickness}
                onSetEdgeAnimation={setEdgeAnimation}
                onSetGrouping={setGrouping}
                onClose={() => setShowVisualControls(false)}
              />
            )}
            {showFilters && (
              <FilterPanel
                filterState={filterState}
                filteredOutCount={filteredOutCellIds.size}
                totalCount={structure.cells.size}
                categoricalMetas={filterMetas}
                onSetMode={setFilterMode}
                onToggleValue={toggleFilterValue}
                onClearAll={clearFilters}
                onClose={() => setShowFilters(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Right: Data Panel */}
        <div className="flex-[2] min-w-[320px] max-w-[480px]">
          <DataPanel
            structure={structure}
            focusCellId={state.focusCellId}
            hDimension={state.hDimension}
            vDimension={state.vDimension}
            selectedCells={state.selectedCells}
            overlayDimensions={state.overlayDimensions}
            onFocusCell={setFocus}
            onSelectCell={toggleSelected}
            onHighlightRank={setHighlightedRank}
            highlightedRank={state.highlightedRank}
            onSetHDimension={setHDimension}
            onSetVDimension={setVDimension}
            onToggleOverlay={toggleOverlayDimension}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
