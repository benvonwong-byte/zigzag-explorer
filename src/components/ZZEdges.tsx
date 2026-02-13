import { motion } from 'framer-motion';
import { GAP_X, GAP_Y } from './ZZCell';

interface EdgeProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  isHighlighted: boolean;
}

export function ZZEdge({ fromX, fromY, toX, toY, color, isHighlighted }: EdgeProps) {
  const x1 = fromX * GAP_X;
  const y1 = fromY * GAP_Y;
  const x2 = toX * GAP_X;
  const y2 = toY * GAP_Y;

  // Cubic bezier control points for smooth curves
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx1 = x1 + dx * 0.4;
  const cy1 = y1;
  const cx2 = x2 - dx * 0.4;
  const cy2 = y2;

  const d = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={isHighlighted ? 2 : 1}
      opacity={isHighlighted ? 0.7 : 0.2}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{
        pathLength: 1,
        opacity: isHighlighted ? 0.7 : 0.2,
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    />
  );
}

interface ArrowProps {
  x: number;
  y: number;
  direction: 'right' | 'left' | 'up' | 'down';
  color: string;
  onClick: () => void;
  label: string;
}

export function NavigationArrow({ x, y, direction, color, onClick, label }: ArrowProps) {
  const px = x * GAP_X;
  const py = y * GAP_Y;

  const paths: Record<string, string> = {
    right: 'M -6 -4 L 2 0 L -6 4',
    left: 'M 6 -4 L -2 0 L 6 4',
    up: 'M -4 6 L 0 -2 L 4 6',
    down: 'M -4 -6 L 0 2 L 4 -6',
  };

  return (
    <motion.g
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      whileHover={{ scale: 1.3 }}
      whileTap={{ scale: 0.9 }}
    >
      <circle cx={px} cy={py} r={14} fill="var(--bg-tertiary)" stroke={color} strokeWidth={1} opacity={0.6} />
      <path
        d={paths[direction]}
        transform={`translate(${px},${py})`}
        fill={color}
        stroke="none"
        opacity={0.8}
      />
      <title>{label}</title>
    </motion.g>
  );
}
