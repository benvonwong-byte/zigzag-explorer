import type { PigeonProfile } from '../types/pigeon';

const PIGEON_NAMES = [
  'Percy', 'Henrietta', 'Dusty', 'Marble', 'Slate',
  'Coo-Coo', 'Feathers', 'Pecky', 'Waddles', 'Strut',
  'Bobble', 'Patches', 'Speckle', 'Shadow', 'Puff',
  'Rusty', 'Storm', 'Pepper', 'Ash', 'Olive',
  'Cobalt', 'Misty', 'Ember', 'Flint', 'Hazel',
  'Nimbus', 'Plume', 'Thistle', 'Wren', 'Zephyr',
];

let nameIndex = 0;

function getNextName(): string {
  const name = PIGEON_NAMES[nameIndex % PIGEON_NAMES.length];
  nameIndex++;
  return nameIndex > PIGEON_NAMES.length
    ? `${name} ${Math.floor(nameIndex / PIGEON_NAMES.length) + 1}`
    : name;
}

export function setNameIndex(index: number) {
  nameIndex = index;
}

/**
 * Convert RGB to HSV. Returns [h, s, v] where h is 0-360, s and v are 0-1.
 */
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : d / max;
  return [h, s, max];
}

/**
 * Extract a rich feature vector from a cropped bird image.
 * Uses a 5x5 spatial grid with RGB means, HSV hue/saturation, and
 * per-cell color variance (texture indicator).
 * Dimensions: 5x5x3 (RGB) + 5x5x2 (HS) + 5x5 (variance) = 150
 */
export function extractColorSignature(canvas: HTMLCanvasElement): number[] {
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Array(150).fill(0);

  const w = canvas.width;
  const h = canvas.height;
  const gridSize = 5;
  const cellW = Math.floor(w / gridSize);
  const cellH = Math.floor(h / gridSize);

  if (cellW < 1 || cellH < 1) return new Array(150).fill(0);

  const rgbFeatures: number[] = [];
  const hsvFeatures: number[] = [];
  const varianceFeatures: number[] = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const data = ctx.getImageData(col * cellW, row * cellH, cellW, cellH).data;
      const pixelCount = data.length / 4;

      let rSum = 0, gSum = 0, bSum = 0;
      let hSum = 0, sSum = 0;

      for (let i = 0; i < data.length; i += 4) {
        rSum += data[i];
        gSum += data[i + 1];
        bSum += data[i + 2];
        const [hue, sat] = rgbToHsv(data[i], data[i + 1], data[i + 2]);
        hSum += hue;
        sSum += sat;
      }

      const rMean = rSum / pixelCount;
      const gMean = gSum / pixelCount;
      const bMean = bSum / pixelCount;

      // Texture: color variance (sample every 4th pixel for speed)
      let variance = 0;
      let sampleCount = 0;
      for (let i = 0; i < data.length; i += 16) {
        const dr = data[i] - rMean;
        const dg = data[i + 1] - gMean;
        const db = data[i + 2] - bMean;
        variance += dr * dr + dg * dg + db * db;
        sampleCount++;
      }
      variance /= Math.max(sampleCount, 1);

      rgbFeatures.push(rMean / 255, gMean / 255, bMean / 255);
      hsvFeatures.push(hSum / pixelCount / 360, sSum / pixelCount);
      varianceFeatures.push(Math.min(variance / 5000, 1));
    }
  }

  return [...rgbFeatures, ...hsvFeatures, ...varianceFeatures];
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Richer 150-dim features are more discriminative; lower threshold suffices
const SIMILARITY_THRESHOLD = 0.94;

/**
 * Try to match a detection's feature vector against known pigeons.
 * Returns the matched pigeon ID or null if it's a new individual.
 */
export function matchPigeon(
  signature: number[],
  size: number,
  registry: Map<string, PigeonProfile>
): string | null {
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const [id, profile] of registry) {
    // Skip profiles with incompatible signature length (legacy 27-dim data)
    if (signature.length !== profile.colorSignature.length) continue;

    const colorScore = cosineSimilarity(signature, profile.colorSignature);
    const sizeRatio = Math.min(size, profile.avgSize) / Math.max(size, profile.avgSize);
    const combined = colorScore * 0.85 + sizeRatio * 0.15;

    if (combined > bestScore) {
      bestScore = combined;
      bestMatch = id;
    }
  }

  return bestScore >= SIMILARITY_THRESHOLD ? bestMatch : null;
}

export function createPigeonProfile(
  signature: number[],
  size: number,
  snapshot: string
): PigeonProfile {
  const id = `pigeon-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id,
    name: getNextName(),
    firstSeen: Date.now(),
    lastSeen: Date.now(),
    sightingCount: 1,
    snapshots: [snapshot],
    colorSignature: signature,
    avgSize: size,
  };
}

export function updatePigeonProfile(
  profile: PigeonProfile,
  signature: number[],
  size: number,
  snapshot: string
): PigeonProfile {
  const blendFactor = 0.3;
  const updatedSignature = profile.colorSignature.map(
    (v, i) => v * (1 - blendFactor) + (signature[i] ?? v) * blendFactor
  );

  const snapshots = [...profile.snapshots, snapshot].slice(-5);

  return {
    ...profile,
    lastSeen: Date.now(),
    sightingCount: profile.sightingCount + 1,
    snapshots,
    colorSignature: updatedSignature,
    avgSize: profile.avgSize * 0.8 + size * 0.2,
  };
}

export function resetNameIndex() {
  nameIndex = 0;
}
