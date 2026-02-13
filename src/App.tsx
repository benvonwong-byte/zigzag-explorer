import { useMemo, useEffect } from 'react';
import { ZZVisualization } from './components/ZZVisualization';
import { DataPanel } from './components/DataPanel';
import { SearchBar } from './components/SearchBar';
import { useZZNavigation } from './hooks/useZZNavigation';
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
  } = useZZNavigation(structure);

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
            Star Wars Universe · {structure.cells.size} cells · {structure.dimensions.size} dimensions
          </span>
        </div>
        <div className="flex items-center gap-3">
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
        <div className="flex-[3] min-w-0">
          <ZZVisualization
            structure={structure}
            focusCellId={state.focusCellId}
            hDimension={state.hDimension}
            vDimension={state.vDimension}
            selectedCells={state.selectedCells}
            highlightedRank={state.highlightedRank}
            onFocusCell={setFocus}
            onSelectCell={toggleSelected}
            onSetHDimension={setHDimension}
            onSetVDimension={setVDimension}
            onMove={moveFocus}
          />
        </div>

        {/* Right: Data Panel */}
        <div className="flex-[2] min-w-[320px] max-w-[480px]">
          <DataPanel
            structure={structure}
            focusCellId={state.focusCellId}
            hDimension={state.hDimension}
            vDimension={state.vDimension}
            selectedCells={state.selectedCells}
            onFocusCell={setFocus}
            onSelectCell={toggleSelected}
            onHighlightRank={setHighlightedRank}
            highlightedRank={state.highlightedRank}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
