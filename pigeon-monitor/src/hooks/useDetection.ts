import { useRef, useState, useCallback, useEffect } from 'react';
import type { Detection, PigeonProfile, SightingEvent, AppStats } from '../types/pigeon';
import {
  extractColorSignature,
  matchPigeon,
  createPigeonProfile,
  updatePigeonProfile,
} from '../utils/pigeonIdentifier';

// TF.js and COCO-SSD are loaded dynamically
type CocoSsdModel = {
  detect: (
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  ) => Promise<Array<{ bbox: [number, number, number, number]; class: string; score: number }>>;
};

export function useDetection() {
  const modelRef = useRef<CocoSsdModel | null>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [registry, setRegistry] = useState<Map<string, PigeonProfile>>(new Map());
  const [sightings, setSightings] = useState<SightingEvent[]>([]);
  const [stats, setStats] = useState<AppStats>({
    totalDetections: 0,
    uniquePigeons: 0,
    todaySightings: 0,
    peakHour: null,
    hourlyCounts: new Array(24).fill(0),
  });

  const registryRef = useRef(registry);
  useEffect(() => {
    registryRef.current = registry;
  }, [registry]);

  const loadModel = useCallback(async () => {
    if (modelRef.current || modelLoading) return;
    setModelLoading(true);
    setModelError(null);
    try {
      const tf = await import('@tensorflow/tfjs');
      await tf.ready();
      const cocoSsd = await import('@tensorflow-models/coco-ssd');
      const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
      modelRef.current = model;
      setModelReady(true);
    } catch (err) {
      setModelError(err instanceof Error ? err.message : 'Failed to load detection model');
    } finally {
      setModelLoading(false);
    }
  }, [modelLoading]);

  /**
   * Run detection on a video or canvas element.
   * Filters for "bird" class detections (COCO-SSD bird class includes pigeons).
   */
  const detect = useCallback(
    async (
      source: HTMLVideoElement | HTMLCanvasElement
    ): Promise<Detection[]> => {
      if (!modelRef.current) return [];

      try {
        const predictions = await modelRef.current.detect(source);
        const birdDetections = predictions.filter(
          (p) => p.class === 'bird' && p.score > 0.4
        );

        // Create a scratch canvas to crop detections
        const scratchCanvas = document.createElement('canvas');
        const scratchCtx = scratchCanvas.getContext('2d');
        if (!scratchCtx) return [];

        const sourceWidth =
          source instanceof HTMLVideoElement ? source.videoWidth : source.width;
        const sourceHeight =
          source instanceof HTMLVideoElement ? source.videoHeight : source.height;

        const newDetections: Detection[] = [];
        const currentRegistry = new Map(registryRef.current);
        const newSightings: SightingEvent[] = [];

        for (const pred of birdDetections) {
          const [x, y, w, h] = pred.bbox;

          // Crop the detected region
          scratchCanvas.width = Math.max(1, Math.round(w));
          scratchCanvas.height = Math.max(1, Math.round(h));
          if (source instanceof HTMLVideoElement) {
            scratchCtx.drawImage(
              source,
              x, y, w, h,
              0, 0, scratchCanvas.width, scratchCanvas.height
            );
          } else {
            scratchCtx.drawImage(
              source,
              x, y, w, h,
              0, 0, scratchCanvas.width, scratchCanvas.height
            );
          }

          const snapshot = scratchCanvas.toDataURL('image/jpeg', 0.7);
          const signature = extractColorSignature(scratchCanvas);
          const size = (w / sourceWidth) * (h / sourceHeight);

          // Try to match against known pigeons
          const matchedId = matchPigeon(signature, size, currentRegistry);
          let pigeonId: string;
          let pigeonName: string;

          if (matchedId) {
            const existing = currentRegistry.get(matchedId)!;
            const updated = updatePigeonProfile(existing, signature, size, snapshot);
            currentRegistry.set(matchedId, updated);
            pigeonId = matchedId;
            pigeonName = existing.name;
          } else {
            const newPigeon = createPigeonProfile(signature, size, snapshot);
            currentRegistry.set(newPigeon.id, newPigeon);
            pigeonId = newPigeon.id;
            pigeonName = newPigeon.name;
          }

          const detection: Detection = {
            id: `det-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            bbox: pred.bbox,
            score: pred.score,
            timestamp: Date.now(),
            snapshot,
            pigeonId,
          };
          newDetections.push(detection);

          newSightings.push({
            id: `sight-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            pigeonId,
            pigeonName,
            timestamp: Date.now(),
            duration: 0,
            snapshot,
          });
        }

        setRegistry(currentRegistry);
        setDetections(newDetections);

        if (newSightings.length > 0) {
          setSightings((prev) => [...newSightings, ...prev].slice(0, 200));

          // Update stats
          setStats((prev) => {
            const hourlyCounts = [...prev.hourlyCounts];
            const currentHour = new Date().getHours();
            hourlyCounts[currentHour] += newSightings.length;

            const peakHour = hourlyCounts.indexOf(Math.max(...hourlyCounts));
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            return {
              totalDetections: prev.totalDetections + newSightings.length,
              uniquePigeons: currentRegistry.size,
              todaySightings: prev.todaySightings + newSightings.length,
              peakHour,
              hourlyCounts,
            };
          });
        }

        return newDetections;
      } catch {
        return [];
      }
    },
    []
  );

  return {
    modelLoading,
    modelReady,
    modelError,
    loadModel,
    detect,
    detections,
    registry,
    sightings,
    stats,
  };
}
