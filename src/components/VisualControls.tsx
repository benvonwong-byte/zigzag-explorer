import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  VisualEncodingState,
  PropertyMeta,
  CellFillMapping,
  CellSizeMapping,
  CellOpacityMapping,
  CellBorderMapping,
  CellShapeMapping,
  EdgeDashMapping,
  EdgeThicknessMapping,
  EdgeAnimationConfig,
  GroupingConfig,
  FlowMarkerType,
  FlowMarkerConfig,
} from '../model/VisualMapping';
import { autoShapeMap, autoDashMap, STARWARS_EMOJIS } from '../model/VisualMapping';

interface Props {
  config: VisualEncodingState;
  propertyMetas: PropertyMeta[];
  overlayDimensions?: Set<string>;
  onSetCellFill: (v: CellFillMapping) => void;
  onSetCellSize: (v: CellSizeMapping) => void;
  onSetCellOpacity: (v: CellOpacityMapping) => void;
  onSetCellBorder: (v: CellBorderMapping) => void;
  onSetCellShape: (v: CellShapeMapping) => void;
  onSetEdgeDash: (v: EdgeDashMapping) => void;
  onSetEdgeThickness: (v: EdgeThicknessMapping) => void;
  onSetEdgeAnimation: (v: EdgeAnimationConfig) => void;
  onSetGrouping: (v: GroupingConfig) => void;
  onClose: () => void;
}

type SectionId = 'fill' | 'size' | 'opacity' | 'border' | 'shape' | 'edgeDash' | 'edgeThick' | 'edgeAnim' | 'grouping';

export function VisualControls({
  config,
  propertyMetas,
  overlayDimensions,
  onSetCellFill,
  onSetCellSize,
  onSetCellOpacity,
  onSetCellBorder,
  onSetCellShape,
  onSetEdgeDash,
  onSetEdgeThickness,
  onSetEdgeAnimation,
  onSetGrouping,
  onClose,
}: Props) {
  const [expanded, setExpanded] = useState<SectionId | null>(null);

  const numericMetas = propertyMetas.filter(m => m.type === 'numeric');
  const categoricalMetas = propertyMetas.filter(m => m.type === 'categorical');

  const toggle = (id: SectionId) => setExpanded(prev => (prev === id ? null : id));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="absolute top-0 left-0 bottom-0 w-[280px] bg-[var(--bg-secondary)] border-r border-[var(--border-color)] overflow-y-auto z-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border-color)]">
        <span className="text-[11px] uppercase tracking-widest text-[var(--text-muted)]">Visual Encoding</span>
        <button
          onClick={onClose}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div className="p-2 flex flex-col gap-1">
        {/* ===== CELL CHANNELS ===== */}
        <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] px-2 pt-2 pb-1">Cells</div>

        {/* Cell Fill Color */}
        <Section
          id="fill"
          label="Fill Color"
          enabled={config.cell.fill.enabled}
          expanded={expanded}
          onToggle={toggle}
          onEnable={(enabled) =>
            onSetCellFill({ ...config.cell.fill, enabled })
          }
        >
          <PropertySelect
            label="Property"
            value={config.cell.fill.property}
            options={propertyMetas}
            onChange={(property) =>
              onSetCellFill({ ...config.cell.fill, property })
            }
          />
        </Section>

        {/* Cell Size */}
        <Section
          id="size"
          label="Size"
          enabled={config.cell.size.enabled}
          expanded={expanded}
          onToggle={toggle}
          onEnable={(enabled) =>
            onSetCellSize({ ...config.cell.size, enabled })
          }
        >
          <PropertySelect
            label="Property"
            value={config.cell.size.property}
            options={numericMetas}
            onChange={(property) =>
              onSetCellSize({ ...config.cell.size, property })
            }
          />
          <SliderRow
            label="Min scale"
            value={config.cell.size.minScale}
            min={0.3}
            max={1}
            step={0.05}
            onChange={(minScale) =>
              onSetCellSize({ ...config.cell.size, minScale })
            }
          />
          <SliderRow
            label="Max scale"
            value={config.cell.size.maxScale}
            min={1}
            max={2}
            step={0.05}
            onChange={(maxScale) =>
              onSetCellSize({ ...config.cell.size, maxScale })
            }
          />
        </Section>

        {/* Cell Opacity */}
        <Section
          id="opacity"
          label="Opacity"
          enabled={config.cell.opacity.enabled}
          expanded={expanded}
          onToggle={toggle}
          onEnable={(enabled) =>
            onSetCellOpacity({ ...config.cell.opacity, enabled })
          }
        >
          <PropertySelect
            label="Property"
            value={config.cell.opacity.property}
            options={numericMetas}
            onChange={(property) =>
              onSetCellOpacity({ ...config.cell.opacity, property })
            }
          />
          <SliderRow
            label="Min opacity"
            value={config.cell.opacity.minOpacity}
            min={0.1}
            max={0.8}
            step={0.05}
            onChange={(minOpacity) =>
              onSetCellOpacity({ ...config.cell.opacity, minOpacity })
            }
          />
        </Section>

        {/* Cell Border */}
        <Section
          id="border"
          label="Border Width"
          enabled={config.cell.border.enabled}
          expanded={expanded}
          onToggle={toggle}
          onEnable={(enabled) =>
            onSetCellBorder({ ...config.cell.border, enabled })
          }
        >
          <PropertySelect
            label="Property"
            value={config.cell.border.property}
            options={numericMetas}
            onChange={(property) =>
              onSetCellBorder({ ...config.cell.border, property })
            }
          />
        </Section>

        {/* Cell Shape */}
        <Section
          id="shape"
          label="Shape"
          enabled={config.cell.shape.enabled}
          expanded={expanded}
          onToggle={toggle}
          onEnable={(enabled) =>
            onSetCellShape({ ...config.cell.shape, enabled })
          }
        >
          <PropertySelect
            label="Property"
            value={config.cell.shape.property}
            options={categoricalMetas.filter(m => (m.categories?.length ?? 0) <= 6)}
            onChange={(property) => {
              const meta = categoricalMetas.find(m => m.key === property);
              const shapeMap = meta?.categories ? autoShapeMap(meta.categories) : {};
              onSetCellShape({ ...config.cell.shape, property, shapeMap });
            }}
          />
          {config.cell.shape.property && (
            <div className="mt-1 flex flex-wrap gap-1">
              {Object.entries(config.cell.shape.shapeMap).map(([val, shape]) => (
                <span
                  key={val}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                >
                  {val}: {shape}
                </span>
              ))}
            </div>
          )}
        </Section>

        {/* ===== EDGE CHANNELS ===== */}
        <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] px-2 pt-3 pb-1">Edges</div>

        {/* Edge Dash */}
        <Section
          id="edgeDash"
          label="Dash Pattern"
          enabled={config.edge.dash.enabled}
          expanded={expanded}
          onToggle={toggle}
          onEnable={(enabled) =>
            onSetEdgeDash({ ...config.edge.dash, enabled })
          }
        >
          <PropertySelect
            label="Property"
            value={config.edge.dash.property}
            options={categoricalMetas.filter(m => (m.categories?.length ?? 0) <= 5)}
            onChange={(property) => {
              const meta = categoricalMetas.find(m => m.key === property);
              const dashMap = meta?.categories ? autoDashMap(meta.categories) : {};
              onSetEdgeDash({ ...config.edge.dash, property, dashMap });
            }}
          />
        </Section>

        {/* Edge Thickness */}
        <Section
          id="edgeThick"
          label="Thickness"
          enabled={config.edge.thickness.enabled}
          expanded={expanded}
          onToggle={toggle}
          onEnable={(enabled) =>
            onSetEdgeThickness({ ...config.edge.thickness, enabled })
          }
        >
          <PropertySelect
            label="Property"
            value={config.edge.thickness.property}
            options={numericMetas}
            onChange={(property) =>
              onSetEdgeThickness({ ...config.edge.thickness, property })
            }
          />
        </Section>

        {/* Edge Animation */}
        <Section
          id="edgeAnim"
          label="Flow Animation"
          enabled={config.edge.animation.enabled}
          expanded={expanded}
          onToggle={toggle}
          onEnable={(enabled) =>
            onSetEdgeAnimation({ ...config.edge.animation, enabled })
          }
        >
          <SliderRow
            label="Speed"
            value={config.edge.animation.speed}
            min={5}
            max={100}
            step={5}
            onChange={(speed) =>
              onSetEdgeAnimation({ ...config.edge.animation, speed })
            }
          />
          <MarkerPicker
            label="Marker"
            config={config.edge.animation.marker}
            onChange={(marker) =>
              onSetEdgeAnimation({ ...config.edge.animation, marker })
            }
          />
          <SliderRow
            label="Size"
            value={config.edge.animation.marker.size}
            min={1}
            max={6}
            step={0.5}
            onChange={(size) =>
              onSetEdgeAnimation({
                ...config.edge.animation,
                marker: { ...config.edge.animation.marker, size },
              })
            }
          />
          {/* Per-dimension markers when overlays are active */}
          {overlayDimensions && overlayDimensions.size > 0 && (
            <div className="mt-2 border-t border-[var(--border-color)] pt-2">
              <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Per-Dimension Markers</div>
              {Array.from(overlayDimensions).map(dim => {
                const dimMarker = config.edge.animation.perDimensionMarkers[dim] ?? config.edge.animation.marker;
                return (
                  <div key={dim} className="mb-1.5">
                    <div className="text-[10px] text-[var(--text-secondary)] mb-0.5">{dim.replace('d.', '')}</div>
                    <MarkerPicker
                      label=""
                      config={dimMarker}
                      onChange={(m) =>
                        onSetEdgeAnimation({
                          ...config.edge.animation,
                          perDimensionMarkers: {
                            ...config.edge.animation.perDimensionMarkers,
                            [dim]: m,
                          },
                        })
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* ===== GROUPING ===== */}
        <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] px-2 pt-3 pb-1">Grouping</div>

        <Section
          id="grouping"
          label="Group By"
          enabled={config.grouping.enabled}
          expanded={expanded}
          onToggle={toggle}
          onEnable={(enabled) =>
            onSetGrouping({ ...config.grouping, enabled })
          }
        >
          <PropertySelect
            label="Property"
            value={config.grouping.property}
            options={categoricalMetas}
            onChange={(property) =>
              onSetGrouping({ ...config.grouping, property })
            }
          />
          <div className="flex items-center gap-2 mt-1">
            <label className="text-[10px] text-[var(--text-muted)]">Labels</label>
            <input
              type="checkbox"
              checked={config.grouping.showLabels}
              onChange={(e) =>
                onSetGrouping({ ...config.grouping, showLabels: e.target.checked })
              }
              className="accent-[var(--accent-cyan)]"
            />
          </div>
          <SliderRow
            label="Opacity"
            value={config.grouping.opacity}
            min={0.02}
            max={0.25}
            step={0.01}
            onChange={(opacity) =>
              onSetGrouping({ ...config.grouping, opacity })
            }
          />
        </Section>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Section({
  id,
  label,
  enabled,
  expanded,
  onToggle,
  onEnable,
  children,
}: {
  id: SectionId;
  label: string;
  enabled: boolean;
  expanded: SectionId | null;
  onToggle: (id: SectionId) => void;
  onEnable: (enabled: boolean) => void;
  children: React.ReactNode;
}) {
  const isExpanded = expanded === id;

  return (
    <div className="rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)]">
      <button
        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left cursor-pointer"
        onClick={() => onToggle(id)}
      >
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            e.stopPropagation();
            onEnable(e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className="accent-[var(--accent-cyan)]"
        />
        <span
          className="text-[11px] flex-1"
          style={{ color: enabled ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          {label}
        </span>
        <span className="text-[10px] text-[var(--text-muted)]">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-2.5 pb-2 pt-1 border-t border-[var(--border-color)]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PropertySelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: PropertyMeta[];
  onChange: (property: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[10px] text-[var(--text-muted)] shrink-0">{label}</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="flex-1 text-[10px] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded px-1.5 py-1 outline-none"
      >
        <option value="">— none —</option>
        {options.map((m) => (
          <option key={m.key} value={m.key}>
            {m.key}
            {m.type === 'numeric' ? ` (${m.min}–${m.max})` : ` (${m.categories?.length ?? 0})`}
            {m.nullCount > 0 ? ` [${m.nullCount} null]` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

const MARKER_TYPES: { type: FlowMarkerType; label: string }[] = [
  { type: 'circle', label: '●' },
  { type: 'triangle', label: '▲' },
  { type: 'diamond', label: '◆' },
  { type: 'square', label: '■' },
  { type: 'star', label: '★' },
  { type: 'emoji', label: '🎯' },
];

function MarkerPicker({
  label,
  config: markerConfig,
  onChange,
}: {
  label: string;
  config: FlowMarkerConfig;
  onChange: (config: FlowMarkerConfig) => void;
}) {
  const [showEmojis, setShowEmojis] = useState(false);

  return (
    <div className="mt-1">
      {label && <div className="text-[10px] text-[var(--text-muted)] mb-1">{label}</div>}
      <div className="flex gap-1 flex-wrap">
        {MARKER_TYPES.map(mt => (
          <button
            key={mt.type}
            onClick={() => {
              if (mt.type === 'emoji') {
                setShowEmojis(prev => !prev);
                if (!markerConfig.emojiUrl) return;
                onChange({ ...markerConfig, type: 'emoji' });
              } else {
                setShowEmojis(false);
                onChange({ ...markerConfig, type: mt.type, emojiUrl: undefined, emojiLabel: undefined });
              }
            }}
            className="w-6 h-6 flex items-center justify-center rounded border text-[11px] transition-all cursor-pointer"
            style={{
              borderColor: markerConfig.type === mt.type ? 'var(--accent-cyan)' : 'var(--border-color)',
              color: markerConfig.type === mt.type ? 'var(--accent-cyan)' : 'var(--text-muted)',
              background: markerConfig.type === mt.type ? 'rgba(0,229,255,0.08)' : 'transparent',
            }}
            title={mt.type}
          >
            {mt.label}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {showEmojis && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-1.5 grid grid-cols-5 gap-1 max-h-32 overflow-y-auto p-1 rounded border border-[var(--border-color)] bg-[var(--bg-primary)]">
              {STARWARS_EMOJIS.map(emoji => (
                <button
                  key={emoji.id}
                  onClick={() => {
                    onChange({ ...markerConfig, type: 'emoji', emojiUrl: emoji.url, emojiLabel: emoji.label });
                    setShowEmojis(false);
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer border"
                  style={{
                    borderColor: markerConfig.emojiUrl === emoji.url ? 'var(--accent-cyan)' : 'transparent',
                  }}
                  title={emoji.label}
                >
                  <img src={emoji.url} alt={emoji.label} className="w-7 h-7 object-contain" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <label className="text-[10px] text-[var(--text-muted)] shrink-0 w-16">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-[var(--accent-cyan)] h-1"
      />
      <span className="text-[10px] text-[var(--text-secondary)] w-8 text-right">{value.toFixed(2)}</span>
    </div>
  );
}
