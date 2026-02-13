import { useState, useMemo, useCallback } from 'react';
import type {
  VisualEncodingState,
  PropertyMeta,
  ResolvedCellVisuals,
  ResolvedEdgeVisuals,
  CellShape,
  CellFillMapping,
  CellSizeMapping,
  CellOpacityMapping,
  CellBorderMapping,
  CellShapeMapping,
  EdgeDashMapping,
  EdgeThicknessMapping,
  EdgeAnimationConfig,
  GroupingConfig,
  DashPattern,
  FlowMarkerConfig,
} from '../model/VisualMapping';
import {
  DEFAULT_VISUAL_ENCODING,
  DEFAULT_FLOW_MARKER,
  inferPropertyMeta,
  categoricalColor,
  numericColor,
  lerp,
  DASH_PATTERNS,
  autoShapeMap,
  autoDashMap,
} from '../model/VisualMapping';
import type { ZZStructure, CellData } from '../model/ZZStructure';

export function useVisualEncoding(structure: ZZStructure) {
  const [config, setConfig] = useState<VisualEncodingState>(DEFAULT_VISUAL_ENCODING);

  const propertyMetas = useMemo(() => inferPropertyMeta(structure), [structure]);

  const metaMap = useMemo(() => {
    const map = new Map<string, PropertyMeta>();
    for (const m of propertyMetas) map.set(m.key, m);
    return map;
  }, [propertyMetas]);

  // --- Granular setters ---

  const setCellFill = useCallback((fill: CellFillMapping) => {
    setConfig(prev => ({ ...prev, cell: { ...prev.cell, fill } }));
  }, []);

  const setCellSize = useCallback((size: CellSizeMapping) => {
    setConfig(prev => ({ ...prev, cell: { ...prev.cell, size } }));
  }, []);

  const setCellOpacity = useCallback((opacity: CellOpacityMapping) => {
    setConfig(prev => ({ ...prev, cell: { ...prev.cell, opacity } }));
  }, []);

  const setCellBorder = useCallback((border: CellBorderMapping) => {
    setConfig(prev => ({ ...prev, cell: { ...prev.cell, border } }));
  }, []);

  const setCellShape = useCallback((shape: CellShapeMapping) => {
    setConfig(prev => ({ ...prev, cell: { ...prev.cell, shape } }));
  }, []);

  const setEdgeDash = useCallback((dash: EdgeDashMapping) => {
    setConfig(prev => ({ ...prev, edge: { ...prev.edge, dash } }));
  }, []);

  const setEdgeThickness = useCallback((thickness: EdgeThicknessMapping) => {
    setConfig(prev => ({ ...prev, edge: { ...prev.edge, thickness } }));
  }, []);

  const setEdgeAnimation = useCallback((animation: EdgeAnimationConfig) => {
    setConfig(prev => ({ ...prev, edge: { ...prev.edge, animation } }));
  }, []);

  const setGrouping = useCallback((grouping: GroupingConfig) => {
    setConfig(prev => ({ ...prev, grouping }));
  }, []);

  // --- Resolver: cell visuals ---

  const resolveCellVisuals = useCallback(
    (cellData: CellData): ResolvedCellVisuals => {
      const result: ResolvedCellVisuals = {};
      const { cell } = config;

      // Fill color
      if (cell.fill.enabled && cell.fill.property) {
        const meta = metaMap.get(cell.fill.property);
        const val = cellData.properties[cell.fill.property];
        if (meta && val !== null && val !== undefined) {
          if (meta.type === 'categorical' && typeof val === 'string' && meta.categories) {
            result.fillColor = categoricalColor(val, meta.categories);
          } else if (meta.type === 'numeric' && typeof val === 'number' && meta.min !== undefined && meta.max !== undefined) {
            result.fillColor = numericColor(val, meta.min, meta.max);
          }
        }
      }

      // Size
      if (cell.size.enabled && cell.size.property) {
        const meta = metaMap.get(cell.size.property);
        const val = cellData.properties[cell.size.property];
        if (meta?.type === 'numeric' && typeof val === 'number' && meta.min !== undefined && meta.max !== undefined) {
          result.scale = lerp(val, meta.min, meta.max, cell.size.minScale, cell.size.maxScale);
        }
      }

      // Opacity
      if (cell.opacity.enabled && cell.opacity.property) {
        const meta = metaMap.get(cell.opacity.property);
        const val = cellData.properties[cell.opacity.property];
        if (meta?.type === 'numeric' && typeof val === 'number' && meta.min !== undefined && meta.max !== undefined) {
          result.opacity = lerp(val, meta.min, meta.max, cell.opacity.minOpacity, cell.opacity.maxOpacity);
        }
      }

      // Border width
      if (cell.border.enabled && cell.border.property) {
        const meta = metaMap.get(cell.border.property);
        const val = cellData.properties[cell.border.property];
        if (meta?.type === 'numeric' && typeof val === 'number' && meta.min !== undefined && meta.max !== undefined) {
          result.borderWidth = lerp(val, meta.min, meta.max, cell.border.minWidth, cell.border.maxWidth);
        }
      }

      // Shape
      if (cell.shape.enabled && cell.shape.property) {
        const val = cellData.properties[cell.shape.property];
        if (typeof val === 'string' && cell.shape.shapeMap[val]) {
          result.shape = cell.shape.shapeMap[val] as CellShape;
        }
      }

      return result;
    },
    [config, metaMap]
  );

  // --- Resolver: edge visuals ---

  const resolveEdgeVisuals = useCallback(
    (fromData: CellData, toData: CellData, dimName: string): ResolvedEdgeVisuals => {
      const result: ResolvedEdgeVisuals = {};
      const { edge } = config;

      // Dash pattern
      if (edge.dash.enabled && edge.dash.property) {
        const val = fromData.properties[edge.dash.property];
        if (typeof val === 'string' && edge.dash.dashMap[val]) {
          const pattern = edge.dash.dashMap[val] as DashPattern;
          result.dashArray = DASH_PATTERNS[pattern];
        }
      }

      // Thickness
      if (edge.thickness.enabled && edge.thickness.property) {
        const meta = metaMap.get(edge.thickness.property);
        const fromVal = fromData.properties[edge.thickness.property];
        const toVal = toData.properties[edge.thickness.property];
        if (meta?.type === 'numeric' && meta.min !== undefined && meta.max !== undefined) {
          const fv = typeof fromVal === 'number' ? fromVal : meta.min;
          const tv = typeof toVal === 'number' ? toVal : meta.min;
          const avg = (fv + tv) / 2;
          result.strokeWidth = lerp(avg, meta.min, meta.max, edge.thickness.minWidth, edge.thickness.maxWidth);
        }
      }

      // Animation + marker
      if (edge.animation.enabled) {
        result.animate = true;
        result.animateSpeed = edge.animation.speed;
        // Per-dimension marker override, else global marker
        result.marker = edge.animation.perDimensionMarkers[dimName] ?? edge.animation.marker;
      }

      return result;
    },
    [config, metaMap]
  );

  return {
    config,
    setConfig,
    propertyMetas,
    resolveCellVisuals,
    resolveEdgeVisuals,
    // Granular setters
    setCellFill,
    setCellSize,
    setCellOpacity,
    setCellBorder,
    setCellShape,
    setEdgeDash,
    setEdgeThickness,
    setEdgeAnimation,
    setGrouping,
    // Helpers for auto-mapping
    autoShapeMap,
    autoDashMap,
  };
}
