import { motion } from 'framer-motion';
import { DimensionMeta } from '../model/ZZStructure';

interface Props {
  dimensions: DimensionMeta[];
  activeDimension: string;
  axis: 'H' | 'V';
  onSelect: (dim: string) => void;
}

export function DimensionSelector({ dimensions, activeDimension, axis, onSelect }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mr-1 w-3">
        {axis}
      </span>
      {dimensions.map(dim => {
        const isActive = dim.name === activeDimension;
        const displayName = dim.name.replace('d.', '');
        return (
          <motion.button
            key={dim.name}
            onClick={() => onSelect(dim.name)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative px-2 py-1 text-[11px] rounded border transition-all cursor-pointer"
            style={{
              borderColor: isActive ? dim.color : 'var(--border-color)',
              color: isActive ? dim.color : 'var(--text-secondary)',
              background: isActive ? `${dim.color}15` : 'transparent',
            }}
          >
            {displayName}
            {isActive && (
              <motion.div
                layoutId={`dim-indicator-${axis}`}
                className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                style={{ background: dim.color }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
