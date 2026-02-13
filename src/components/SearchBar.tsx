import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZZStructure } from '../model/ZZStructure';

interface Props {
  structure: ZZStructure;
  onSelectCell: (id: string) => void;
}

export function SearchBar({ structure, onSelectCell }: Props) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return structure
      .getAllCells()
      .filter(
        cell =>
          cell.data.label.toLowerCase().includes(q) ||
          Object.values(cell.data.properties).some(v =>
            String(v ?? '').toLowerCase().includes(q)
          )
      )
      .slice(0, 12);
  }, [structure, query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded border border-[var(--border-color)] text-[11px] text-[var(--text-muted)] hover:border-[var(--text-muted)] transition-all cursor-pointer bg-[var(--bg-tertiary)]"
      >
        <span>⌘K</span>
        <span>Search cells...</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
            onClick={() => { setIsOpen(false); setQuery(''); }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="relative w-[480px] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search characters, factions, species..."
                className="w-full px-4 py-3 bg-transparent text-sm text-[var(--text-primary)] outline-none border-b border-[var(--border-color)] placeholder-[var(--text-muted)]"
              />
              {results.length > 0 && (
                <div className="max-h-64 overflow-y-auto py-1">
                  {results.map(cell => (
                    <button
                      key={cell.id}
                      onClick={() => {
                        onSelectCell(cell.id);
                        setIsOpen(false);
                        setQuery('');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer"
                    >
                      <span className="text-sm text-[var(--text-primary)]">
                        {cell.data.label}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] ml-auto">
                        {cell.data.properties.faction} · {cell.data.properties.species}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {query.trim() && results.length === 0 && (
                <div className="px-4 py-6 text-center text-[11px] text-[var(--text-muted)]">
                  No results found
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
