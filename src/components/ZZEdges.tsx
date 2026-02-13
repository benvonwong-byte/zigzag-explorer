import { motion } from 'framer-motion';
import { GAP_X, GAP_Y } from './ZZCell';
import type { ResolvedEdgeVisuals, FlowMarkerConfig } from '../model/VisualMapping';
import { DEFAULT_FLOW_MARKER } from '../model/VisualMapping';

interface EdgeProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  isHighlighted: boolean;
  edgeKey?: string;
  visualEncoding?: ResolvedEdgeVisuals;
  isOverlay?: boolean;
  overlayIndex?: number;
}

export function ZZEdge({
  fromX, fromY, toX, toY, color, isHighlighted, edgeKey, visualEncoding,
  isOverlay, overlayIndex = 0,
}: EdgeProps) {
  const x1 = fromX * GAP_X;
  const y1 = fromY * GAP_Y;
  const x2 = toX * GAP_X;
  const y2 = toY * GAP_Y;

  // Perpendicular offset for overlay edges to avoid overlap
  let offX = 0;
  let offY = 0;
  if (isOverlay) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const perpX = -dy / len;
    const perpY = dx / len;
    const offset = (overlayIndex + 1) * 4;
    offX = perpX * offset;
    offY = perpY * offset;
  }

  const ax1 = x1 + offX;
  const ay1 = y1 + offY;
  const ax2 = x2 + offX;
  const ay2 = y2 + offY;

  const dx = ax2 - ax1;
  const _dy = ay2 - ay1;
  void _dy;
  const cx1 = ax1 + dx * 0.4;
  const cy1 = ay1;
  const cx2 = ax2 - dx * 0.4;
  const cy2 = ay2;

  const d = `M ${ax1} ${ay1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${ax2} ${ay2}`;

  const defaultStrokeWidth = isOverlay ? 0.8 : (isHighlighted ? 2 : 1);
  const strokeWidth = visualEncoding?.strokeWidth ?? defaultStrokeWidth;
  const dashArray = visualEncoding?.dashArray;
  const pathId = edgeKey ? `epath-${edgeKey}` : undefined;

  const baseOpacity = isOverlay ? 0.12 : 0.2;
  const highlightOpacity = isOverlay ? 0.45 : 0.7;
  const opacity = isHighlighted ? highlightOpacity : baseOpacity;

  const markerConfig = visualEncoding?.marker ?? DEFAULT_FLOW_MARKER;

  return (
    <g>
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        opacity={opacity}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: 1,
          opacity,
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
      {visualEncoding?.animate && pathId && (
        <>
          <path id={pathId} d={d} fill="none" stroke="none" />
          <FlowMarker
            config={markerConfig}
            color={color}
            pathId={pathId}
            speed={visualEncoding.animateSpeed ?? 30}
          />
        </>
      )}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Flow Marker — configurable shape or emoji that travels along the edge path
// ---------------------------------------------------------------------------

function starPoints(r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 5; i++) {
    const outerAngle = (Math.PI / 2) + (i * 2 * Math.PI / 5);
    const innerAngle = outerAngle + Math.PI / 5;
    pts.push(`${Math.cos(outerAngle) * r},${-Math.sin(outerAngle) * r}`);
    pts.push(`${Math.cos(innerAngle) * r * 0.4},${-Math.sin(innerAngle) * r * 0.4}`);
  }
  return pts.join(' ');
}

function FlowMarker({ config, color, pathId, speed }: {
  config: FlowMarkerConfig;
  color: string;
  pathId: string;
  speed: number;
}) {
  const dur = `${Math.max(1, 100 / speed)}s`;
  const s = config.size;

  const renderMarkerShape = () => {
    switch (config.type) {
      case 'triangle':
        return (
          <polygon
            points={`0,${-s} ${s * 0.87},${s * 0.5} ${-s * 0.87},${s * 0.5}`}
            fill={color}
            opacity={0.8}
          />
        );
      case 'diamond':
        return (
          <polygon
            points={`0,${-s} ${s},0 0,${s} ${-s},0`}
            fill={color}
            opacity={0.8}
          />
        );
      case 'square':
        return <rect x={-s} y={-s} width={s * 2} height={s * 2} fill={color} opacity={0.8} />;
      case 'star':
        return <polygon points={starPoints(s)} fill={color} opacity={0.8} />;
      case 'emoji':
        if (config.emojiUrl) {
          return (
            <image
              href={config.emojiUrl}
              x={-s}
              y={-s}
              width={s * 2}
              height={s * 2}
            />
          );
        }
        return <circle r={s} fill={color} opacity={0.8} />;
      case 'circle':
      default:
        return <circle r={s} fill={color} opacity={0.8} />;
    }
  };

  return (
    <g>
      {renderMarkerShape()}
      <animateMotion
        dur={dur}
        repeatCount="indefinite"
      >
        <mpath href={`#${pathId}`} />
      </animateMotion>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Navigation Arrow
// ---------------------------------------------------------------------------

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
