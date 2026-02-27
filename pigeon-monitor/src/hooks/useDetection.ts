import { useRef, useState, useCallback, useEffect } from 'react';
import type { Detection, PigeonProfile, SightingEvent, AppStats, Visit, CoOccurrence } from '../types/pigeon';
import {
  extractColorSignature,
  matchPigeon,
  createPigeonProfile,
  updatePigeonProfile,
  setNameIndex,
} from '../utils/pigeonIdentifier';
import { useStorage } from './useStorage';

// If a pigeon isn't seen for 5 minutes, the next sighting starts a new visit
const VISIT_GAP_MS = 5 * 60 * 1000;

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
  const [visits, setVisits] = useState<Visit[]>([]);
  const [coOccurrences, setCoOccurrences] = useState<Map<string, CoOccurrence>>(new Map());
  const [stats, setStats] = useState<AppStats>({
    totalDetections: 0,
    uniquePigeons: 0,
    todaySightings: 0,
    peakHour: null,
    hourlyCounts: new Array(24).fill(0),
    totalVisits: 0,
    todayVisits: 0,
  });
  const [dataLoaded, setDataLoaded] = useState(false);

  const registryRef = useRef(registry);
  const visitsRef = useRef(visits);
  const coOccurrencesRef = useRef(coOccurrences);
  const storage = useStorage();
  const storageRef = useRef(storage);

  useEffect(() => { registryRef.current = registry; }, [registry]);
  useEffect(() => { visitsRef.current = visits; }, [visits]);
  useEffect(() => { coOccurrencesRef.current = coOccurrences; }, [coOccurrences]);
  useEffect(() => { storageRef.current = storage; }, [storage]);

  // Load persisted data on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [savedPigeons, savedVisits, savedCoOcc] = await Promise.all([
          storageRef.current.loadPigeons(),
          storageRef.current.loadVisits(),
          storageRef.current.loadCoOccurrences(),
        ]);

        if (cancelled) return;

        if (savedPigeons.size > 0) {
          setRegistry(savedPigeons);
          setNameIndex(savedPigeons.size);
        }
        if (savedVisits.length > 0) {
          setVisits(savedVisits);
        }
        if (savedCoOcc.size > 0) {
          setCoOccurrences(savedCoOcc);
        }

        // Compute initial stats from persisted data
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayTs = todayStart.getTime();

        const hourlyCounts = new Array(24).fill(0);
        for (const v of savedVisits) {
          if (v.startTime >= todayTs) {
            const hour = new Date(v.startTime).getHours();
            hourlyCounts[hour] += v.sightingCount;
          }
        }
        const peakHour = hourlyCounts.some((c: number) => c > 0)
          ? hourlyCounts.indexOf(Math.max(...hourlyCounts))
          : null;

        let totalDetections = 0;
        for (const p of savedPigeons.values()) {
          totalDetections += p.sightingCount;
        }

        const todayVisits = savedVisits.filter((v: Visit) => v.startTime >= todayTs).length;

        setStats({
          totalDetections,
          uniquePigeons: savedPigeons.size,
          todaySightings: hourlyCounts.reduce((a: number, b: number) => a + b, 0),
          peakHour,
          hourlyCounts,
          totalVisits: savedVisits.length,
          todayVisits,
        });
      } catch (err) {
        console.warn('Failed to load persisted data:', err);
      }
      if (!cancelled) setDataLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

        const scratchCanvas = document.createElement('canvas');
        const scratchCtx = scratchCanvas.getContext('2d');
        if (!scratchCtx) return [];

        const sourceWidth =
          source instanceof HTMLVideoElement ? source.videoWidth : source.width;
        const sourceHeight =
          source instanceof HTMLVideoElement ? source.videoHeight : source.height;

        const newDetections: Detection[] = [];
        const currentRegistry = new Map(registryRef.current);
        const currentVisits = [...visitsRef.current];
        const currentCoOcc = new Map(coOccurrencesRef.current);
        const newSightings: SightingEvent[] = [];
        const framePigeonIds: string[] = [];
        const framePigeonNames = new Map<string, string>();
        const now = Date.now();

        for (const pred of birdDetections) {
          const [x, y, w, h] = pred.bbox;

          scratchCanvas.width = Math.max(1, Math.round(w));
          scratchCanvas.height = Math.max(1, Math.round(h));
          scratchCtx.drawImage(
            source,
            x, y, w, h,
            0, 0, scratchCanvas.width, scratchCanvas.height
          );

          const snapshot = scratchCanvas.toDataURL('image/jpeg', 0.7);
          const signature = extractColorSignature(scratchCanvas);
          const size = (w / sourceWidth) * (h / sourceHeight);

          const matchedId = matchPigeon(signature, size, currentRegistry);
          let pigeonId: string;
          let pigeonName: string;

          if (matchedId) {
            const existing = currentRegistry.get(matchedId)!;
            const updated = updatePigeonProfile(existing, signature, size, snapshot);
            currentRegistry.set(matchedId, updated);
            pigeonId = matchedId;
            pigeonName = existing.name;
            storageRef.current.savePigeon(updated);
          } else {
            const newPigeon = createPigeonProfile(signature, size, snapshot);
            currentRegistry.set(newPigeon.id, newPigeon);
            pigeonId = newPigeon.id;
            pigeonName = newPigeon.name;
            storageRef.current.savePigeon(newPigeon);
          }

          framePigeonIds.push(pigeonId);
          framePigeonNames.set(pigeonId, pigeonName);

          // Visit tracking: extend existing visit or create new one
          const existingVisitIdx = currentVisits.findIndex(
            v => v.pigeonId === pigeonId && (now - v.endTime) < VISIT_GAP_MS
          );

          if (existingVisitIdx >= 0) {
            currentVisits[existingVisitIdx] = {
              ...currentVisits[existingVisitIdx],
              endTime: now,
              sightingCount: currentVisits[existingVisitIdx].sightingCount + 1,
              snapshot,
            };
            storageRef.current.saveVisit(currentVisits[existingVisitIdx]);
          } else {
            const visit: Visit = {
              id: `visit-${now}-${Math.random().toString(36).slice(2, 6)}`,
              pigeonId,
              pigeonName,
              startTime: now,
              endTime: now,
              sightingCount: 1,
              snapshot,
            };
            currentVisits.push(visit);
            storageRef.current.saveVisit(visit);
          }

          newDetections.push({
            id: `det-${now}-${Math.random().toString(36).slice(2, 6)}`,
            bbox: pred.bbox,
            score: pred.score,
            timestamp: now,
            snapshot,
            pigeonId,
          });

          newSightings.push({
            id: `sight-${now}-${Math.random().toString(36).slice(2, 6)}`,
            pigeonId,
            pigeonName,
            timestamp: now,
            duration: 0,
            snapshot,
          });
        }

        // Co-occurrence: record pairs seen in same frame
        const uniqueFrameIds = [...new Set(framePigeonIds)];
        if (uniqueFrameIds.length >= 2) {
          for (let i = 0; i < uniqueFrameIds.length; i++) {
            for (let j = i + 1; j < uniqueFrameIds.length; j++) {
              const [a, b] = [uniqueFrameIds[i], uniqueFrameIds[j]].sort();
              const pairKey = `${a}::${b}`;
              const existing = currentCoOcc.get(pairKey);
              if (existing) {
                const updated = { ...existing, count: existing.count + 1, lastSeen: now };
                currentCoOcc.set(pairKey, updated);
                storageRef.current.saveCoOccurrence(updated);
              } else {
                const co: CoOccurrence = {
                  pairKey,
                  pigeonA: a,
                  pigeonB: b,
                  nameA: framePigeonNames.get(a) || '?',
                  nameB: framePigeonNames.get(b) || '?',
                  count: 1,
                  lastSeen: now,
                };
                currentCoOcc.set(pairKey, co);
                storageRef.current.saveCoOccurrence(co);
              }
            }
          }
        }

        setRegistry(currentRegistry);
        setDetections(newDetections);
        setVisits(currentVisits);
        setCoOccurrences(currentCoOcc);

        if (newSightings.length > 0) {
          setSightings((prev) => [...newSightings, ...prev].slice(0, 200));

          setStats((prev) => {
            const hourlyCounts = [...prev.hourlyCounts];
            const currentHour = new Date().getHours();
            hourlyCounts[currentHour] += newSightings.length;

            const peakHour = hourlyCounts.indexOf(Math.max(...hourlyCounts));
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayTs = todayStart.getTime();
            const todayVisits = currentVisits.filter(v => v.startTime >= todayTs).length;

            return {
              totalDetections: prev.totalDetections + newSightings.length,
              uniquePigeons: currentRegistry.size,
              todaySightings: prev.todaySightings + newSightings.length,
              peakHour,
              hourlyCounts,
              totalVisits: currentVisits.length,
              todayVisits,
            };
          });
        }

        return newDetections;
      } catch {
        return [];
      }
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const clearData = useCallback(async () => {
    await storageRef.current.clearAll();
    setRegistry(new Map());
    setVisits([]);
    setCoOccurrences(new Map());
    setSightings([]);
    setStats({
      totalDetections: 0,
      uniquePigeons: 0,
      todaySightings: 0,
      peakHour: null,
      hourlyCounts: new Array(24).fill(0),
      totalVisits: 0,
      todayVisits: 0,
    });
    setNameIndex(0);
  }, []);

  return {
    modelLoading,
    modelReady,
    modelError,
    loadModel,
    detect,
    detections,
    registry,
    sightings,
    visits,
    coOccurrences,
    stats,
    dataLoaded,
    clearData,
  };
}
