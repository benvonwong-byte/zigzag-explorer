import { motion } from 'framer-motion';
import type { ZZCell as ZZCellType } from '../model/ZZStructure';
import type { ResolvedCellVisuals, CellShape } from '../model/VisualMapping';

interface Props {
  cell: ZZCellType;
  isFocus: boolean;
  isSelected: boolean;
  isInHighlightedRank: boolean;
  isGhosted?: boolean;
  dimColor: string;
  onClick: () => void;
  onDoubleClick: () => void;
  x: number;
  y: number;
  visualEncoding?: ResolvedCellVisuals;
}

const CELL_W = 140;
const CELL_H = 52;
const GAP_X = 160;
const GAP_Y = 68;

const HW = CELL_W / 2;
const HH = CELL_H / 2;

function renderShape(
  shape: CellShape,
  fill: string,
  stroke: string,
  strokeWidth: number,
) {
  switch (shape) {
    case 'circle':
      return (
        <ellipse
          cx={0}
          cy={0}
          rx={HW}
          ry={HH}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case 'diamond':
      return (
        <polygon
          points={`0,${-HH} ${HW},0 0,${HH} ${-HW},0`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case 'hexagon': {
      const inset = HW * 0.15;
      return (
        <polygon
          points={`${-HW + inset},${-HH} ${HW - inset},${-HH} ${HW},0 ${HW - inset},${HH} ${-HW + inset},${HH} ${-HW},0`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    }
    case 'rect':
    default:
      return (
        <rect
          x={-HW}
          y={-HH}
          width={CELL_W}
          height={CELL_H}
          rx={6}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
  }
}

export function ZZCellView({
  cell,
  isFocus,
  isSelected,
  isInHighlightedRank,
  isGhosted,
  dimColor,
  onClick,
  onDoubleClick,
  x,
  y,
  visualEncoding,
}: Props) {
  const px = x * GAP_X;
  const py = y * GAP_Y;

  const borderColor = isGhosted
    ? 'var(--border-color)'
    : isFocus
      ? '#fff'
      : isSelected
        ? 'var(--accent-cyan)'
        : isInHighlightedRank
          ? dimColor
          : 'var(--border-color)';

  // Fill: ghost overrides everything, then state overrides encoding
  const bgColor = isGhosted
    ? 'var(--bg-tertiary)'
    : isFocus
      ? 'rgba(255,255,255,0.08)'
      : isSelected
        ? 'rgba(0,229,255,0.06)'
        : isInHighlightedRank
          ? `${dimColor}10`
          : visualEncoding?.fillColor ?? 'var(--bg-secondary)';

  const strokeW = isGhosted ? 1 : (visualEncoding?.borderWidth ?? (isFocus ? 2 : 1));
  const scale = isGhosted ? 0.9 : (visualEncoding?.scale ?? 1);
  const cellOpacity = isGhosted ? 0.15 : (visualEncoding?.opacity ?? 1);
  const shape: CellShape = isGhosted ? 'rect' : (visualEncoding?.shape ?? 'rect');

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{
        opacity: cellOpacity,
        x: px,
        y: py,
      }}
      exit={{ opacity: 0 }}
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
      <g transform={`scale(${scale})`}>
        {renderShape(shape, bgColor, borderColor, strokeW)}
        {isFocus && (
          <rect
            x={-HW}
            y={-HH}
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
          x={0}
          y={-6}
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
          x={0}
          y={10}
          textAnchor="middle"
          fill="var(--text-muted)"
          fontSize={9}
          fontFamily="'JetBrains Mono', monospace"
        >
          {String(cell.data.properties.faction ?? cell.data.properties.species ?? '')}
        </text>
        {isSelected && (
          <circle cx={HW - 8} cy={-HH + 8} r={3} fill="var(--accent-cyan)" />
        )}
      </g>
    </motion.g>
  );
}

export { CELL_W, CELL_H, GAP_X, GAP_Y };
