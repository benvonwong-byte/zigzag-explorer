import { useCallback, useRef } from 'react';
import type { PigeonProfile, Visit, CoOccurrence } from '../types/pigeon';

const DB_NAME = 'pigeon-monitor';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pigeons')) {
        db.createObjectStore('pigeons', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('visits')) {
        const store = db.createObjectStore('visits', { keyPath: 'id' });
        store.createIndex('pigeonId', 'pigeonId', { unique: false });
        store.createIndex('startTime', 'startTime', { unique: false });
      }
      if (!db.objectStoreNames.contains('cooccurrences')) {
        db.createObjectStore('cooccurrences', { keyPath: 'pairKey' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function useStorage() {
  const dbRef = useRef<IDBDatabase | null>(null);

  const getDB = useCallback(async () => {
    if (!dbRef.current) {
      dbRef.current = await openDB();
    }
    return dbRef.current;
  }, []);

  const loadPigeons = useCallback(async (): Promise<Map<string, PigeonProfile>> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pigeons', 'readonly');
      const request = tx.objectStore('pigeons').getAll();
      request.onsuccess = () => {
        const map = new Map<string, PigeonProfile>();
        for (const p of request.result) map.set(p.id, p);
        resolve(map);
      };
      request.onerror = () => reject(request.error);
    });
  }, [getDB]);

  const savePigeon = useCallback(async (pigeon: PigeonProfile) => {
    const db = await getDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction('pigeons', 'readwrite');
      tx.objectStore('pigeons').put(pigeon);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }, [getDB]);

  const loadVisits = useCallback(async (): Promise<Visit[]> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('visits', 'readonly');
      const request = tx.objectStore('visits').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [getDB]);

  const saveVisit = useCallback(async (visit: Visit) => {
    const db = await getDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction('visits', 'readwrite');
      tx.objectStore('visits').put(visit);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }, [getDB]);

  const loadCoOccurrences = useCallback(async (): Promise<Map<string, CoOccurrence>> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cooccurrences', 'readonly');
      const request = tx.objectStore('cooccurrences').getAll();
      request.onsuccess = () => {
        const map = new Map<string, CoOccurrence>();
        for (const co of request.result) map.set(co.pairKey, co);
        resolve(map);
      };
      request.onerror = () => reject(request.error);
    });
  }, [getDB]);

  const saveCoOccurrence = useCallback(async (co: CoOccurrence) => {
    const db = await getDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction('cooccurrences', 'readwrite');
      tx.objectStore('cooccurrences').put(co);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }, [getDB]);

  const clearAll = useCallback(async () => {
    const db = await getDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(['pigeons', 'visits', 'cooccurrences'], 'readwrite');
      tx.objectStore('pigeons').clear();
      tx.objectStore('visits').clear();
      tx.objectStore('cooccurrences').clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }, [getDB]);

  return {
    loadPigeons,
    savePigeon,
    loadVisits,
    saveVisit,
    loadCoOccurrences,
    saveCoOccurrence,
    clearAll,
  };
}
