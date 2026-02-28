export interface Detection {
  id: string;
  bbox: [number, number, number, number]; // x, y, width, height
  score: number;
  timestamp: number;
  snapshot?: string; // base64 cropped image
  pigeonId?: string; // matched pigeon ID
}

export interface PigeonProfile {
  id: string;
  name: string;
  firstSeen: number;
  lastSeen: number;
  sightingCount: number;
  snapshots: string[]; // base64 cropped images (keep last 5)
  colorSignature: number[]; // feature vector for matching
  avgSize: number; // average bounding box area
}

/** A visit = continuous presence (sightings within VISIT_GAP of each other) */
export interface Visit {
  id: string;
  pigeonId: string;
  pigeonName: string;
  startTime: number;
  endTime: number;
  sightingCount: number;
  snapshot: string;
}

/** Tracks how often two pigeons are seen together in the same frame */
export interface CoOccurrence {
  pairKey: string; // sorted "idA::idB"
  pigeonA: string;
  pigeonB: string;
  nameA: string;
  nameB: string;
  count: number;
  lastSeen: number;
}

export interface SightingEvent {
  id: string;
  pigeonId: string;
  pigeonName: string;
  timestamp: number;
  duration: number; // seconds visible
  snapshot: string;
}

export interface CameraConfig {
  type: 'webcam' | 'ip-camera' | 'image-url';
  url?: string;
  refreshInterval?: number; // ms, for IP camera snapshots
  captureInterval?: number; // ms, how often to run detection (default 5000)
}

export interface AppStats {
  totalDetections: number;
  uniquePigeons: number;
  todaySightings: number;
  peakHour: number | null;
  hourlyCounts: number[];
  totalVisits: number;
  todayVisits: number;
}
