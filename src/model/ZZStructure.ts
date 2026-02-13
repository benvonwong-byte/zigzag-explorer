/**
 * ZigZag Structure — Ted Nelson's generalization of data structure.
 *
 * Core concepts:
 * - Cell: a node holding content
 * - Dimension: a named axis along which cells are linked
 * - Rank: a chain of cells connected along one dimension
 * - Restriction R: each cell has at most one posward and one negward neighbor per dimension
 */

export interface CellData {
  id: string;
  label: string;
  properties: Record<string, string>;
}

export interface ZZCell {
  id: string;
  data: CellData;
  /** dimension -> posward neighbor id */
  posward: Map<string, string>;
  /** dimension -> negward neighbor id */
  negward: Map<string, string>;
}

export type DimensionMeta = {
  name: string;
  color: string;
  description: string;
};

export class ZZStructure {
  cells: Map<string, ZZCell> = new Map();
  dimensions: Map<string, DimensionMeta> = new Map();

  addCell(data: CellData): ZZCell {
    const cell: ZZCell = {
      id: data.id,
      data,
      posward: new Map(),
      negward: new Map(),
    };
    this.cells.set(data.id, cell);
    return cell;
  }

  addDimension(meta: DimensionMeta) {
    this.dimensions.set(meta.name, meta);
  }

  /**
   * Connect cellA --posward--> cellB along a dimension.
   * cellB becomes the negward neighbor of cellA in that dimension and vice-versa.
   * Respects Restriction R: overwrites any existing connection.
   */
  connect(dimName: string, cellAId: string, cellBId: string) {
    const a = this.cells.get(cellAId);
    const b = this.cells.get(cellBId);
    if (!a || !b) return;

    // Break existing posward of A
    const oldPosA = a.posward.get(dimName);
    if (oldPosA) {
      const oldCell = this.cells.get(oldPosA);
      if (oldCell) oldCell.negward.delete(dimName);
    }

    // Break existing negward of B
    const oldNegB = b.negward.get(dimName);
    if (oldNegB) {
      const oldCell = this.cells.get(oldNegB);
      if (oldCell) oldCell.posward.delete(dimName);
    }

    a.posward.set(dimName, cellBId);
    b.negward.set(dimName, cellAId);
  }

  /**
   * Build a rank (chain) from a list of cell IDs along a dimension.
   */
  buildRank(dimName: string, cellIds: string[]) {
    for (let i = 0; i < cellIds.length - 1; i++) {
      this.connect(dimName, cellIds[i], cellIds[i + 1]);
    }
  }

  /**
   * Get the full rank containing a cell along a dimension.
   */
  getRank(cellId: string, dimName: string): string[] {
    const cell = this.cells.get(cellId);
    if (!cell) return [];

    // Walk negward to find the head
    let headId = cellId;
    const visited = new Set<string>();
    visited.add(headId);
    while (true) {
      const c = this.cells.get(headId);
      if (!c) break;
      const neg = c.negward.get(dimName);
      if (!neg || visited.has(neg)) break;
      headId = neg;
      visited.add(headId);
    }

    // Walk posward to collect the rank
    const rank: string[] = [headId];
    visited.clear();
    visited.add(headId);
    let current = headId;
    while (true) {
      const c = this.cells.get(current);
      if (!c) break;
      const pos = c.posward.get(dimName);
      if (!pos || visited.has(pos)) break;
      rank.push(pos);
      visited.add(pos);
      current = pos;
    }

    return rank;
  }

  /**
   * Get neighbors of a cell along a dimension (both directions).
   * Returns up to `radius` cells in each direction.
   */
  getNeighbors(cellId: string, dimName: string, radius: number): string[] {
    const result: string[] = [];

    // Walk negward
    const negCells: string[] = [];
    let current = cellId;
    for (let i = 0; i < radius; i++) {
      const cell = this.cells.get(current);
      if (!cell) break;
      const neg = cell.negward.get(dimName);
      if (!neg) break;
      negCells.unshift(neg);
      current = neg;
    }

    result.push(...negCells);
    result.push(cellId);

    // Walk posward
    current = cellId;
    for (let i = 0; i < radius; i++) {
      const cell = this.cells.get(current);
      if (!cell) break;
      const pos = cell.posward.get(dimName);
      if (!pos) break;
      result.push(pos);
      current = pos;
    }

    return result;
  }

  /**
   * Get all dimensions a cell participates in.
   */
  getCellDimensions(cellId: string): string[] {
    const cell = this.cells.get(cellId);
    if (!cell) return [];
    const dims = new Set<string>();
    for (const d of cell.posward.keys()) dims.add(d);
    for (const d of cell.negward.keys()) dims.add(d);
    return Array.from(dims);
  }

  /**
   * Get all cells as an array
   */
  getAllCells(): ZZCell[] {
    return Array.from(this.cells.values());
  }

  /**
   * Get all cells that share a rank with the given cell on a given dimension
   */
  getRankmates(cellId: string, dimName: string): ZZCell[] {
    const rank = this.getRank(cellId, dimName);
    return rank.map(id => this.cells.get(id)!).filter(Boolean);
  }
}
