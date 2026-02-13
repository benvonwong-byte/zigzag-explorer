import * as d3 from 'd3';
import type { ZZStructure } from './ZZStructure';

// ---------------------------------------------------------------------------
// Property metadata — inferred from data
// ---------------------------------------------------------------------------

export type PropertyType = 'categorical' | 'numeric';

export interface PropertyMeta {
  key: string;
  type: PropertyType;
  categories?: string[];
  min?: number;
  max?: number;
  nullCount: number;
}

export function inferPropertyMeta(structure: ZZStructure): PropertyMeta[] {
  const cells = structure.getAllCells();
  const keyStats = new Map<
    string,
    { numbers: number[]; strings: Set<string>; nulls: number }
  >();

  for (const cell of cells) {
    for (const [key, val] of Object.entries(cell.data.properties)) {
      if (!keyStats.has(key)) {
        keyStats.set(key, { numbers: [], strings: new Set(), nulls: 0 });
      }
      const stat = keyStats.get(key)!;
      if (val === null || val === undefined) {
        stat.nulls++;
      } else if (typeof val === 'number') {
        stat.numbers.push(val);
      } else {
        stat.strings.add(val);
      }
    }
  }

  // Also count nulls for properties not present on some cells
  const allKeys = Array.from(keyStats.keys());
  for (const cell of cells) {
    for (const key of allKeys) {
      if (!(key in cell.data.properties)) {
        keyStats.get(key)!.nulls++;
      }
    }
  }

  const result: PropertyMeta[] = [];
  for (const [key, stat] of keyStats) {
    if (stat.numbers.length > 0 && stat.strings.size === 0) {
      result.push({
        key,
        type: 'numeric',
        min: Math.min(...stat.numbers),
        max: Math.max(...stat.numbers),
        nullCount: stat.nulls,
      });
    } else {
      result.push({
        key,
        type: 'categorical',
        categories: Array.from(stat.strings).sort(),
        nullCount: stat.nulls,
      });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Cell visual channel types
// ---------------------------------------------------------------------------

export type CellShape = 'rect' | 'circle' | 'diamond' | 'hexagon';

export interface CellFillMapping {
  enabled: boolean;
  property: string | null;
}

export interface CellSizeMapping {
  enabled: boolean;
  property: string | null;
  minScale: number;
  maxScale: number;
}

export interface CellOpacityMapping {
  enabled: boolean;
  property: string | null;
  minOpacity: number;
  maxOpacity: number;
}

export interface CellBorderMapping {
  enabled: boolean;
  property: string | null;
  minWidth: number;
  maxWidth: number;
}

export interface CellShapeMapping {
  enabled: boolean;
  property: string | null;
  shapeMap: Record<string, CellShape>;
}

export interface CellVisualConfig {
  fill: CellFillMapping;
  size: CellSizeMapping;
  opacity: CellOpacityMapping;
  border: CellBorderMapping;
  shape: CellShapeMapping;
}

// ---------------------------------------------------------------------------
// Edge visual channel types
// ---------------------------------------------------------------------------

export type DashPattern = 'solid' | 'dashed' | 'dotted';

export interface EdgeDashMapping {
  enabled: boolean;
  property: string | null;
  dashMap: Record<string, DashPattern>;
}

export interface EdgeThicknessMapping {
  enabled: boolean;
  property: string | null;
  minWidth: number;
  maxWidth: number;
}

// ---------------------------------------------------------------------------
// Flow animation marker types
// ---------------------------------------------------------------------------

export type FlowMarkerType = 'circle' | 'triangle' | 'diamond' | 'square' | 'star' | 'emoji';

export interface FlowMarkerConfig {
  type: FlowMarkerType;
  emojiUrl?: string;
  emojiLabel?: string;
  size: number;
}

export const DEFAULT_FLOW_MARKER: FlowMarkerConfig = {
  type: 'circle',
  size: 2.5,
};

export interface StarWarsEmoji {
  id: string;
  label: string;
  url: string;
  category: 'faction' | 'weapon' | 'character' | 'vehicle' | 'droid' | 'misc';
}

export const STARWARS_EMOJIS: StarWarsEmoji[] = [
  // Factions
  { id: 'rebel', label: 'Rebel Alliance', url: 'https://emojis.slackmojis.com/emojis/images/1643514053/113/rebel.png', category: 'faction' },
  { id: 'empire', label: 'Empire', url: 'https://emojis.slackmojis.com/emojis/images/1643514053/114/empire.png', category: 'faction' },
  { id: 'darkside', label: 'Dark Side', url: 'https://emojis.slackmojis.com/emojis/images/1643514235/2031/darkside.png', category: 'faction' },
  // Weapons
  { id: 'lightsaber', label: 'Lightsaber', url: 'https://emojis.slackmojis.com/emojis/images/1643514187/1532/lightsaber.png', category: 'weapon' },
  { id: 'bluelightsaber', label: 'Blue Lightsaber', url: 'https://emojis.slackmojis.com/emojis/images/1643514347/3217/bluelightsaber.png', category: 'weapon' },
  { id: 'evillightsaber', label: 'Red Lightsaber', url: 'https://emojis.slackmojis.com/emojis/images/1643514354/3290/evillightsaber.png', category: 'weapon' },
  { id: 'blacklightsaber', label: 'Darksaber', url: 'https://emojis.slackmojis.com/emojis/images/1643514312/2834/blacklightsaber.png', category: 'weapon' },
  // Characters
  { id: 'yoda', label: 'Yoda', url: 'https://emojis.slackmojis.com/emojis/images/1643514057/137/yoda.png', category: 'character' },
  { id: 'darth_vader', label: 'Darth Vader', url: 'https://emojis.slackmojis.com/emojis/images/1643514056/131/darth_vader.png', category: 'character' },
  { id: 'mandalorian', label: 'Mandalorian', url: 'https://emojis.slackmojis.com/emojis/images/1643514715/7210/mandalorian.png', category: 'character' },
  { id: 'babyyoda', label: 'Grogu', url: 'https://emojis.slackmojis.com/emojis/images/1643514724/7296/babyyoda.png', category: 'character' },
  { id: 'bobafett', label: 'Boba Fett', url: 'https://emojis.slackmojis.com/emojis/images/1643514282/2517/bobafett.png', category: 'character' },
  { id: 'palpatine', label: 'Palpatine', url: 'https://emojis.slackmojis.com/emojis/images/1643514187/1531/palpatine.png', category: 'character' },
  { id: 'kylo_ren', label: 'Kylo Ren', url: 'https://emojis.slackmojis.com/emojis/images/1643514071/277/kylo_ren.png', category: 'character' },
  // Droids
  { id: 'r2d2', label: 'R2-D2', url: 'https://emojis.slackmojis.com/emojis/images/1643514056/132/r2d2.png', category: 'droid' },
  { id: 'c3po', label: 'C-3PO', url: 'https://emojis.slackmojis.com/emojis/images/1643514056/133/c3po.png', category: 'droid' },
  { id: 'bb8', label: 'BB-8', url: 'https://emojis.slackmojis.com/emojis/images/1643514064/206/bb8.png', category: 'droid' },
  // Vehicles
  { id: 'x-wing', label: 'X-Wing', url: 'https://emojis.slackmojis.com/emojis/images/1643514057/135/x-wing.png', category: 'vehicle' },
  { id: 'tie-fighter', label: 'TIE Fighter', url: 'https://emojis.slackmojis.com/emojis/images/1643514249/2182/tie-fighter.png', category: 'vehicle' },
  // Misc
  { id: 'death-star', label: 'Death Star', url: 'https://emojis.slackmojis.com/emojis/images/1643514248/2175/death-star.png', category: 'misc' },
];

export interface EdgeAnimationConfig {
  enabled: boolean;
  speed: number;
  marker: FlowMarkerConfig;
  perDimensionMarkers: Record<string, FlowMarkerConfig>;
}

export interface EdgeVisualConfig {
  dash: EdgeDashMapping;
  thickness: EdgeThicknessMapping;
  animation: EdgeAnimationConfig;
}

// ---------------------------------------------------------------------------
// Grouping
// ---------------------------------------------------------------------------

export interface GroupingConfig {
  enabled: boolean;
  property: string | null;
  showLabels: boolean;
  opacity: number;
}

// ---------------------------------------------------------------------------
// Top-level state
// ---------------------------------------------------------------------------

export interface VisualEncodingState {
  cell: CellVisualConfig;
  edge: EdgeVisualConfig;
  grouping: GroupingConfig;
}

export const DEFAULT_VISUAL_ENCODING: VisualEncodingState = {
  cell: {
    fill: { enabled: false, property: null },
    size: { enabled: false, property: null, minScale: 0.7, maxScale: 1.3 },
    opacity: { enabled: false, property: null, minOpacity: 0.4, maxOpacity: 1.0 },
    border: { enabled: false, property: null, minWidth: 1, maxWidth: 5 },
    shape: { enabled: false, property: null, shapeMap: {} },
  },
  edge: {
    dash: { enabled: false, property: null, dashMap: {} },
    thickness: { enabled: false, property: null, minWidth: 1, maxWidth: 4 },
    animation: { enabled: false, speed: 30, marker: { ...DEFAULT_FLOW_MARKER }, perDimensionMarkers: {} },
  },
  grouping: {
    enabled: false,
    property: null,
    showLabels: true,
    opacity: 0.08,
  },
};

// ---------------------------------------------------------------------------
// Resolved visual properties (output of resolvers)
// ---------------------------------------------------------------------------

export interface ResolvedCellVisuals {
  fillColor?: string;
  scale?: number;
  opacity?: number;
  borderWidth?: number;
  shape?: CellShape;
}

export interface ResolvedEdgeVisuals {
  dashArray?: string;
  strokeWidth?: number;
  animate?: boolean;
  animateSpeed?: number;
  marker?: FlowMarkerConfig;
}

// ---------------------------------------------------------------------------
// Color scale helpers
// ---------------------------------------------------------------------------

const CATEGORICAL_COLORS = d3.schemeTableau10;

export function categoricalColor(value: string, categories: string[]): string {
  const idx = categories.indexOf(value);
  return CATEGORICAL_COLORS[idx % CATEGORICAL_COLORS.length];
}

export function numericColor(value: number, min: number, max: number): string {
  const t = max === min ? 0.5 : (value - min) / (max - min);
  return d3.interpolateViridis(t);
}

export function lerp(value: number, min: number, max: number, outMin: number, outMax: number): number {
  if (max === min) return (outMin + outMax) / 2;
  const t = (value - min) / (max - min);
  return outMin + t * (outMax - outMin);
}

// ---------------------------------------------------------------------------
// Dash pattern SVG mapping
// ---------------------------------------------------------------------------

export const DASH_PATTERNS: Record<DashPattern, string | undefined> = {
  solid: undefined,
  dashed: '8 4',
  dotted: '2 4',
};

// ---------------------------------------------------------------------------
// Default shape assignments for categories
// ---------------------------------------------------------------------------

const SHAPES: CellShape[] = ['rect', 'circle', 'diamond', 'hexagon'];

export function autoShapeMap(categories: string[]): Record<string, CellShape> {
  const map: Record<string, CellShape> = {};
  for (let i = 0; i < categories.length; i++) {
    map[categories[i]] = SHAPES[i % SHAPES.length];
  }
  return map;
}

const DASH_OPTIONS: DashPattern[] = ['solid', 'dashed', 'dotted'];

export function autoDashMap(categories: string[]): Record<string, DashPattern> {
  const map: Record<string, DashPattern> = {};
  for (let i = 0; i < categories.length; i++) {
    map[categories[i]] = DASH_OPTIONS[i % DASH_OPTIONS.length];
  }
  return map;
}
