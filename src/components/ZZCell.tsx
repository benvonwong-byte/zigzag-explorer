import { motion } from 'framer-motion';
import { ZZCell as ZZCellType } from '../model/ZZStructure';

interface Props {
  cell: ZZCellType;
  isFocus: boolean;
  isSelected: boolean;
  isInHighlightedRank: boolean;
  dimColor: string;
  onClick: () => void;
  onDoubleClick: () => void;
  x: number;
  y: number;
}

const CELL_W = 140;
const CELL_H = 52;
const GAP_X = 160;
const GAP_Y = 68;

export function ZZCellView({
  cell,
  isFocus,
  isSelected,
  isInHighlightedRank,
  dimColor,
  onClick,
  onDoubleClick,
  x,
  y,
}: Props) {
  const px = x * GAP_X;
  const py = y * GAP_Y;

  const borderColor = isFocus
    ? '#fff'
    : isSelected
      ? 'var(--accent-cyan)'
      : isInHighlightedRank
        ? dimColor
        : 'var(--border-color)';

  const bgColor = isFocus
    ? 'rgba(255,255,255,0.08)'
    : isSelected
      ? 'rgba(0,229,255,0.06)'
      : isInHighlightedRank
        ? `${dimColor}10`
        : 'var(--bg-secondary)';

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: px - CELL_W / 2,
        y: py - CELL_H / 2,
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 28,
        mass: 0.8,
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={{ cursor: 'pointer' }}
    >
      <rect
        width={CELL_W}
        height={CELL_H}
        rx={6}
        fill={bgColor}
        stroke={borderColor}
        strokeWidth={isFocus ? 2 : 1}
      />
      {isFocus && (
        <rect
          width={CELL_W}
          height={CELL_H}
          rx={6}
          fill="none"
          stroke="white"
          strokeWidth={1}
          opacity={0.3}
          filter="url(#glow)"
        />
      )}
      <text
        x={CELL_W / 2}
        y={CELL_H / 2 - 6}
        textAnchor="middle"
        fill={isFocus ? '#fff' : 'var(--text-primary)'}
        fontSize={11}
        fontWeight={isFocus ? 600 : 400}
        fontFamily="'JetBrains Mono', monospace"
      >
        {cell.data.label.length > 16
          ? cell.data.label.slice(0, 15) + '…'
          : cell.data.label}
      </text>
      <text
        x={CELL_W / 2}
        y={CELL_H / 2 + 10}
        textAnchor="middle"
        fill="var(--text-muted)"
        fontSize={9}
        fontFamily="'JetBrains Mono', monospace"
      >
        {cell.data.properties.faction || cell.data.properties.species || ''}
      </text>
      {isSelected && (
        <circle cx={CELL_W - 8} cy={8} r={3} fill="var(--accent-cyan)" />
      )}
    </motion.g>
  );
}

export { CELL_W, CELL_H, GAP_X, GAP_Y };
