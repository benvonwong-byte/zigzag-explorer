import { useState, useCallback } from 'react';
import type { CameraConfig } from './types/pigeon';
import { useDetection } from './hooks/useDetection';
import { CameraSetup } from './components/CameraSetup';
import { CameraFeed } from './components/CameraFeed';
import { PigeonRegistry } from './components/PigeonRegistry';
import { SightingLog } from './components/SightingLog';
import { StatsPanel } from './components/StatsPanel';
import { VisitTimeline } from './components/VisitTimeline';
import { SocialNetwork } from './components/SocialNetwork';

type Tab = 'live' | 'visits' | 'social' | 'registry';

export default function App() {
  const [cameraConfig, setCameraConfig] = useState<CameraConfig | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('live');
  const {
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

  const hasData = registry.size > 0 || visits.length > 0;
  const showDashboard = cameraConfig || hasData;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🐦</div>
            <div>
              <h1 className="text-lg font-bold text-gray-100">Pigeon Monitor</h1>
              <p className="text-[11px] text-gray-500">Individual detection, visit tracking & social mapping</p>
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
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
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
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
              >
                Disconnect
              </button>
            )}
            {hasData && !cameraConfig && (
              <button
                onClick={clearData}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-300 transition-colors"
              >
                Clear Data
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {!showDashboard || !dataLoaded ? (
          /* Landing: no camera, no stored data */
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🐦</div>
              <h2 className="text-2xl font-bold text-gray-200 mb-2">
                Pigeon Detection Station
              </h2>
              <p className="text-gray-500 max-w-md">
                Connect a camera to start detecting and identifying individual pigeons.
                Track visit frequency over time and map social relationships between your regulars.
              </p>
            </div>
            <CameraSetup onConnect={handleConnect} />
          </div>
        ) : (
          <>
            {/* Tab bar */}
            <div className="flex items-center gap-1 bg-gray-900/60 rounded-xl p-1 mb-6">
              {([
                { id: 'live' as Tab, label: 'Live Feed', badge: isScanning ? detections.length : undefined },
                { id: 'visits' as Tab, label: 'Visit History', badge: visits.length || undefined },
                { id: 'social' as Tab, label: 'Relationships', badge: coOccurrences.size || undefined },
                { id: 'registry' as Tab, label: 'Registry', badge: registry.size || undefined },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 px-4 text-sm rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-green-600 text-white font-medium'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-800 text-gray-500'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'live' && (
              <div className="space-y-6">
                {/* Camera + Stats row */}
                {cameraConfig ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <CameraFeed
                        config={cameraConfig}
                        detections={detections}
                        onFrame={handleFrame}
                        isRunning={isScanning}
                      />
                    </div>
                    <div>
                      <StatsPanel stats={stats} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 text-center">
                        <p className="text-gray-400 mb-4">Camera not connected. Connect one to resume live detection.</p>
                        <CameraSetup onConnect={handleConnect} />
                      </div>
                    </div>
                    <div>
                      <StatsPanel stats={stats} />
                    </div>
                  </div>
                )}

                {/* Sighting log */}
                <SightingLog sightings={sightings} />
              </div>
            )}

            {activeTab === 'visits' && (
              <div className="space-y-6">
                <StatsPanel stats={stats} />
                <VisitTimeline visits={visits} registry={registry} />
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-6">
                <SocialNetwork coOccurrences={coOccurrences} registry={registry} />
              </div>
            )}

            {activeTab === 'registry' && (
              <div className="space-y-6">
                <PigeonRegistry registry={registry} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
