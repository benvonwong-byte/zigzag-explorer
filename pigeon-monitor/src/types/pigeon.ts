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
  colorSignature: number[]; // simplified color histogram for matching
  avgSize: number; // average bounding box area
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
}

export interface AppStats {
  totalDetections: number;
  uniquePigeons: number;
  todaySightings: number;
  peakHour: number | null;
  hourlyCounts: number[];
}
