import { useRef, useEffect, useState, useCallback } from 'react';
import type { CameraConfig, Detection } from '../types/pigeon';

interface CameraFeedProps {
  config: CameraConfig;
  detections: Detection[];
  onFrame: (source: HTMLVideoElement | HTMLCanvasElement) => void;
  isRunning: boolean;
}

// Slower detection interval on mobile to preserve battery and reduce heat
const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const DETECTION_INTERVAL = isMobile ? 2500 : 1500;

export function CameraFeed({ config, detections, onFrame, isRunning }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  // Start webcam — prefer rear camera on mobile (phone mounted at feeder)
  useEffect(() => {
    if (config.type !== 'webcam') return;

    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: isMobile ? { ideal: 'environment' } : undefined,
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setError('Could not access camera. Please allow camera permissions.');
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [config.type]);

  // Handle IP camera / image URL
  useEffect(() => {
    if (config.type === 'webcam' || !config.url) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let cancelled = false;
    const refresh = config.refreshInterval || 2000;

    const fetchFrame = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (cancelled) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        setVideoReady(true);
      };
      img.onerror = () => {
        if (!cancelled) setError('Failed to load image from URL. Check CORS settings.');
      };
      const separator = config.url!.includes('?') ? '&' : '?';
      img.src = `${config.url}${separator}_t=${Date.now()}`;
    };

    fetchFrame();
    const id = window.setInterval(fetchFrame, refresh);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [config.type, config.url, config.refreshInterval]);

  // Run detection loop
  const runDetectionLoop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!isRunning) return;

    const tick = () => {
      if (config.type === 'webcam' && videoRef.current && videoRef.current.readyState >= 2) {
        onFrame(videoRef.current);
      } else if (config.type !== 'webcam' && canvasRef.current) {
        onFrame(canvasRef.current);
      }
    };

    intervalRef.current = window.setInterval(tick, DETECTION_INTERVAL);
    tick();
  }, [isRunning, config.type, onFrame]);

  useEffect(() => {
    runDetectionLoop();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [runDetectionLoop]);

  // Draw detection overlays
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    let sourceWidth: number;
    let sourceHeight: number;

    if (config.type === 'webcam' && videoRef.current) {
      sourceWidth = videoRef.current.videoWidth || 640;
      sourceHeight = videoRef.current.videoHeight || 480;
    } else if (canvasRef.current) {
      sourceWidth = canvasRef.current.width || 640;
      sourceHeight = canvasRef.current.height || 480;
    } else {
      return;
    }

    overlay.width = sourceWidth;
    overlay.height = sourceHeight;
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    const scale = Math.min(sourceWidth / 640, 2);

    for (const det of detections) {
      const [x, y, w, h] = det.bbox;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(x, y, w, h);

      const label = `Pigeon (${Math.round(det.score * 100)}%)`;
      const fontSize = Math.round(12 * scale);
      ctx.font = `${fontSize}px monospace`;
      const textWidth = ctx.measureText(label).width;
      const labelHeight = fontSize + 8;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x, y - labelHeight, textWidth + 8, labelHeight);
      ctx.fillStyle = '#22c55e';
      ctx.fillText(label, x + 4, y - 5);
    }
  }, [detections, config.type]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64 bg-gray-900 rounded-xl border border-red-500/30">
        <p className="text-red-400 text-center px-4 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden">
      {config.type === 'webcam' ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedData={() => setVideoReady(true)}
          className="w-full h-auto"
        />
      ) : (
        <canvas ref={canvasRef} className="w-full h-auto" />
      )}
      <canvas
        ref={overlayRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />
      {!videoReady && config.type === 'webcam' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
          <p className="text-gray-400 animate-pulse text-sm">Starting camera...</p>
        </div>
      )}
      {isRunning && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] sm:text-xs text-green-400 font-mono">SCANNING</span>
        </div>
      )}
    </div>
  );
}
