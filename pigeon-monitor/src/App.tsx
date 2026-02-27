import { useState, useCallback } from 'react';
import type { CameraConfig } from './types/pigeon';
import { useDetection } from './hooks/useDetection';
import { CameraSetup } from './components/CameraSetup';
import { CameraFeed } from './components/CameraFeed';
import { PigeonRegistry } from './components/PigeonRegistry';
import { SightingLog } from './components/SightingLog';
import { StatsPanel } from './components/StatsPanel';

export default function App() {
  const [cameraConfig, setCameraConfig] = useState<CameraConfig | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const {
    modelLoading,
    modelReady,
    modelError,
    loadModel,
    detect,
    detections,
    registry,
    sightings,
    stats,
  } = useDetection();

  const handleConnect = useCallback(
    async (config: CameraConfig) => {
      setCameraConfig(config);
      await loadModel();
      setIsScanning(true);
    },
    [loadModel]
  );

  const handleFrame = useCallback(
    (source: HTMLVideoElement | HTMLCanvasElement) => {
      if (modelReady) {
        detect(source);
      }
    },
    [modelReady, detect]
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🐦</div>
            <div>
              <h1 className="text-xl font-bold text-gray-100">Pigeon Monitor</h1>
              <p className="text-xs text-gray-500">Individual pigeon detection & tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {modelLoading && (
              <span className="text-xs text-yellow-400 animate-pulse">Loading AI model...</span>
            )}
            {modelError && (
              <span className="text-xs text-red-400">Model error: {modelError}</span>
            )}
            {modelReady && (
              <span className="text-xs text-green-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Model ready
              </span>
            )}
            {cameraConfig && (
              <button
                onClick={() => setIsScanning((s) => !s)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isScanning
                    ? 'bg-red-600/80 hover:bg-red-600 text-white'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
              >
                {isScanning ? 'Pause' : 'Resume'}
              </button>
            )}
            {cameraConfig && (
              <button
                onClick={() => {
                  setCameraConfig(null);
                  setIsScanning(false);
                }}
                className="px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {!cameraConfig ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🐦</div>
              <h2 className="text-2xl font-bold text-gray-200 mb-2">
                Pigeon Detection Station
              </h2>
              <p className="text-gray-500 max-w-md">
                Connect a camera to start detecting and identifying individual pigeons
                using AI-powered computer vision. Each pigeon gets a unique profile.
              </p>
            </div>
            <CameraSetup onConnect={handleConnect} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Camera feed */}
            <div className="lg:col-span-2 space-y-6">
              <CameraFeed
                config={cameraConfig}
                detections={detections}
                onFrame={handleFrame}
                isRunning={isScanning}
              />
              <SightingLog sightings={sightings} />
            </div>

            {/* Right column: Registry & Stats */}
            <div className="space-y-6">
              <StatsPanel stats={stats} />
              <PigeonRegistry registry={registry} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
