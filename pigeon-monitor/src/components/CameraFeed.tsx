import { useRef, useEffect, useState, useCallback } from 'react';
import type { CameraConfig, Detection } from '../types/pigeon';

interface CameraFeedProps {
  config: CameraConfig;
  detections: Detection[];
  onFrame: (source: HTMLCanvasElement) => void;
  isRunning: boolean;
}

const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Max resolution for ML processing — COCO-SSD doesn't benefit from higher
const PROCESS_WIDTH = 640;
const PROCESS_HEIGHT = 480;

// Motion detection: compare downscaled frames to skip ML when nothing changed
const MOTION_GRID = 16; // 16x12 grid of cells for motion check
const MOTION_THRESHOLD = 15; // mean pixel difference to count as motion
const MOTION_MIN_CELLS = 0.03; // 3% of cells must have motion

export function CameraFeed({ config, detections, onFrame, isRunning }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const processCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sourceReady, setSourceReady] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [lastCaptureTime, setLastCaptureTime] = useState<number | null>(null);

  const captureInterval = config.captureInterval || 5000;

  // Start camera stream (kept hidden — we grab frames from it)
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

  // Handle IP camera / image URL: fetch images periodically
  useEffect(() => {
    if (config.type === 'webcam' || !config.url) return;

    const canvas = displayCanvasRef.current;
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
        setSourceReady(true);
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

  /**
   * Check if the current frame has meaningful motion compared to the previous one.
   * Uses a coarse grid comparison — very cheap (~1ms).
   */
  const hasMotion = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number): boolean => {
    const cellW = Math.floor(w / MOTION_GRID);
    const cellH = Math.floor(h / (MOTION_GRID * 3 / 4));
    const rows = Math.floor(h / cellH);
    const totalCells = MOTION_GRID * rows;

    // Sample the center pixel of each grid cell
    const currentFrame = new Uint8ClampedArray(totalCells * 3);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < MOTION_GRID; c++) {
        const px = ctx.getImageData(
          c * cellW + Math.floor(cellW / 2),
          r * cellH + Math.floor(cellH / 2),
          1, 1
        ).data;
        const idx = (r * MOTION_GRID + c) * 3;
        currentFrame[idx] = px[0];
        currentFrame[idx + 1] = px[1];
        currentFrame[idx + 2] = px[2];
      }
    }

    const prev = prevFrameRef.current;
    prevFrameRef.current = currentFrame;

    // First frame — always process
    if (!prev || prev.length !== currentFrame.length) return true;

    let motionCells = 0;
    for (let i = 0; i < totalCells; i++) {
      const idx = i * 3;
      const diff = Math.abs(currentFrame[idx] - prev[idx])
        + Math.abs(currentFrame[idx + 1] - prev[idx + 1])
        + Math.abs(currentFrame[idx + 2] - prev[idx + 2]);
      if (diff / 3 > MOTION_THRESHOLD) motionCells++;
    }

    return motionCells / totalCells >= MOTION_MIN_CELLS;
  }, []);

  // Capture and process loop
  const runCaptureLoop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!isRunning) return;

    // Get or create the processing canvas (downscaled for ML)
    const getProcessCanvas = (): HTMLCanvasElement | null => {
      let processCanvas = processCanvasRef.current;
      if (!processCanvas) {
        processCanvas = document.createElement('canvas');
        (processCanvasRef as React.MutableRefObject<HTMLCanvasElement>).current = processCanvas;
      }
      return processCanvas;
    };

    const capture = () => {
      const processCanvas = getProcessCanvas();
      if (!processCanvas) return;
      const pCtx = processCanvas.getContext('2d');
      if (!pCtx) return;

      let source: HTMLVideoElement | HTMLCanvasElement | null = null;
      let srcW = 0;
      let srcH = 0;

      if (config.type === 'webcam') {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;
        source = video;
        srcW = video.videoWidth;
        srcH = video.videoHeight;
      } else {
        const canvas = displayCanvasRef.current;
        if (!canvas || canvas.width === 0) return;
        source = canvas;
        srcW = canvas.width;
        srcH = canvas.height;
      }

      // Downscale to processing resolution
      const scale = Math.min(PROCESS_WIDTH / srcW, PROCESS_HEIGHT / srcH, 1);
      const pw = Math.round(srcW * scale);
      const ph = Math.round(srcH * scale);
      processCanvas.width = pw;
      processCanvas.height = ph;
      pCtx.drawImage(source, 0, 0, pw, ph);

      // Also update the display canvas for webcam (show latest snapshot)
      if (config.type === 'webcam' && displayCanvasRef.current) {
        const dCanvas = displayCanvasRef.current;
        const dCtx = dCanvas.getContext('2d');
        if (dCtx) {
          dCanvas.width = srcW;
          dCanvas.height = srcH;
          dCtx.drawImage(source, 0, 0);
        }
      }

      // Motion gate — skip ML if nothing changed
      if (!hasMotion(pCtx, pw, ph)) {
        setSkippedCount(s => s + 1);
        return;
      }

      setCaptureCount(c => c + 1);
      setLastCaptureTime(Date.now());
      setSourceReady(true);

      // Send downscaled frame to detection
      onFrame(processCanvas);
    };

    intervalRef.current = window.setInterval(capture, captureInterval);
    // First capture immediately
    capture();
  }, [isRunning, config.type, captureInterval, onFrame, hasMotion]);

  useEffect(() => {
    runCaptureLoop();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [runCaptureLoop]);

  // Draw detection overlays on the display canvas
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    // Get dimensions from the display canvas or video
    let sourceWidth: number;
    let sourceHeight: number;

    if (displayCanvasRef.current && displayCanvasRef.current.width > 0) {
      sourceWidth = displayCanvasRef.current.width;
      sourceHeight = displayCanvasRef.current.height;
    } else if (config.type === 'webcam' && videoRef.current) {
      sourceWidth = videoRef.current.videoWidth || 640;
      sourceHeight = videoRef.current.videoHeight || 480;
    } else {
      return;
    }

    overlay.width = sourceWidth;
    overlay.height = sourceHeight;
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    // Detection bboxes are in processing canvas coordinates — scale up
    const processCanvas = processCanvasRef.current;
    const scaleX = processCanvas ? sourceWidth / processCanvas.width : 1;
    const scaleY = processCanvas ? sourceHeight / processCanvas.height : 1;
    const labelScale = Math.min(sourceWidth / 640, 2);

    for (const det of detections) {
      const [x, y, w, h] = det.bbox;
      const sx = x * scaleX;
      const sy = y * scaleY;
      const sw = w * scaleX;
      const sh = h * scaleY;

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2 * labelScale;
      ctx.strokeRect(sx, sy, sw, sh);

      const label = `Pigeon (${Math.round(det.score * 100)}%)`;
      const fontSize = Math.round(12 * labelScale);
      ctx.font = `${fontSize}px monospace`;
      const textWidth = ctx.measureText(label).width;
      const labelHeight = fontSize + 8;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(sx, sy - labelHeight, textWidth + 8, labelHeight);
      ctx.fillStyle = '#22c55e';
      ctx.fillText(label, sx + 4, sy - 5);
    }
  }, [detections, config.type]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64 bg-gray-900 rounded-xl border border-red-500/30">
        <p className="text-red-400 text-center px-4 text-sm">{error}</p>
      </div>
    );
  }

  const secondsSinceCapture = lastCaptureTime ? Math.floor((Date.now() - lastCaptureTime) / 1000) : null;

  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden">
      {/* Hidden video element — only used as frame source for webcam */}
      {config.type === 'webcam' && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedData={() => setSourceReady(true)}
          className="hidden"
        />
      )}

      {/* Display canvas — shows the latest captured frame */}
      <canvas ref={displayCanvasRef} className="w-full h-auto" />

      {/* Detection overlay */}
      <canvas
        ref={overlayRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />

      {/* Loading state */}
      {!sourceReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 min-h-[200px]">
          <p className="text-gray-400 animate-pulse text-sm">Starting camera...</p>
        </div>
      )}

      {/* Status bar */}
      {isRunning && (
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] sm:text-xs text-green-400 font-mono">
              {captureInterval / 1000}s
            </span>
          </div>
          <div className="flex items-center gap-2">
            {skippedCount > 0 && (
              <span className="text-[10px] text-gray-500 bg-black/40 px-1.5 py-0.5 rounded-full">
                {skippedCount} skipped
              </span>
            )}
            <span className="text-[10px] text-gray-400 bg-black/60 px-2 py-0.5 rounded-full font-mono">
              {captureCount} captures
              {secondsSinceCapture !== null && secondsSinceCapture > 0 && (
                <span className="text-gray-600"> \u00b7 {secondsSinceCapture}s ago</span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
