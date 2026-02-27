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

/**
 * Extract a simplified color histogram from a cropped bird image.
 * We divide the image into a 3x3 grid and compute average RGB per cell,
 * yielding a 27-dimensional feature vector. This is crude but enough
 * to distinguish pigeons with noticeably different plumage.
 */
export function extractColorSignature(canvas: HTMLCanvasElement): number[] {
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Array(27).fill(128);

  const w = canvas.width;
  const h = canvas.height;
  const cellW = Math.floor(w / 3);
  const cellH = Math.floor(h / 3);
  const signature: number[] = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const data = ctx.getImageData(col * cellW, row * cellH, cellW, cellH).data;
      let r = 0, g = 0, b = 0;
      const pixelCount = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
      signature.push(r / pixelCount, g / pixelCount, b / pixelCount);
    }
  }
  return signature;
}

/**
 * Compare two color signatures using cosine similarity.
 */
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

const SIMILARITY_THRESHOLD = 0.985;

/**
 * Try to match a detection's color signature against known pigeons.
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
    const colorScore = cosineSimilarity(signature, profile.colorSignature);
    // Also factor in size similarity (pigeons of similar size score higher)
    const sizeRatio = Math.min(size, profile.avgSize) / Math.max(size, profile.avgSize);
    const combined = colorScore * 0.85 + sizeRatio * 0.15;

    if (combined > bestScore) {
      bestScore = combined;
      bestMatch = id;
    }
  }

  return bestScore >= SIMILARITY_THRESHOLD ? bestMatch : null;
}

/**
 * Create a new pigeon profile.
 */
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

/**
 * Update a pigeon profile with a new sighting.
 */
export function updatePigeonProfile(
  profile: PigeonProfile,
  signature: number[],
  size: number,
  snapshot: string
): PigeonProfile {
  // Running average of the color signature
  const blendFactor = 0.3;
  const updatedSignature = profile.colorSignature.map(
    (v, i) => v * (1 - blendFactor) + signature[i] * blendFactor
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
