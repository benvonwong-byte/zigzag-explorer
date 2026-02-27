import { useState, useCallback, useEffect } from 'react';
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

const TAB_ICONS: Record<Tab, string> = {
  live: '\u25CF', // filled circle
  visits: '\u2593', // chart bars
  social: '\u2194', // double arrow (connections)
  registry: '\u2630', // list
};

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

  // Detect standalone (PWA) mode and add body class
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as Record<string, unknown>).standalone === true);
    if (isStandalone) {
      document.body.classList.add('pwa-standalone');
    }
  }, []);

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

  const tabs: { id: Tab; label: string; shortLabel: string; badge?: number }[] = [
    { id: 'live', label: 'Live Feed', shortLabel: 'Live', badge: isScanning ? detections.length : undefined },
    { id: 'visits', label: 'Visits', shortLabel: 'Visits', badge: visits.length || undefined },
    { id: 'social', label: 'Social', shortLabel: 'Social', badge: coOccurrences.size || undefined },
    { id: 'registry', label: 'Registry', shortLabel: 'Registry', badge: registry.size || undefined },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col" style={{ paddingTop: 'var(--sat)' }}>
      {/* Header */}
      <header className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-20" style={{ paddingTop: 'var(--sat)' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-xl sm:text-2xl">🐦</div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-100">Pigeon Monitor</h1>
              <p className="text-[10px] sm:text-[11px] text-gray-500 hidden sm:block">
                Individual detection, visit tracking & social mapping
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {modelLoading && (
              <span className="text-[10px] sm:text-xs text-yellow-400 animate-pulse">Loading AI...</span>
            )}
            {modelError && (
              <span className="text-[10px] sm:text-xs text-red-400 max-w-[120px] truncate">
                Error: {modelError}
              </span>
            )}
            {modelReady && (
              <span className="text-[10px] sm:text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="hidden sm:inline">Model ready</span>
              </span>
            )}
            {cameraConfig && (
              <button
                onClick={() => setIsScanning((s) => !s)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[36px] ${
                  isScanning
                    ? 'bg-red-600/80 active:bg-red-700 text-white'
                    : 'bg-green-600 active:bg-green-700 text-white'
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
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-gray-800 active:bg-gray-700 text-gray-300 transition-colors min-h-[36px]"
              >
                Disconnect
              </button>
            )}
            {hasData && !cameraConfig && (
              <button
                onClick={clearData}
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-gray-800 active:bg-red-900/50 text-gray-400 transition-colors min-h-[36px]"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 pb-20 sm:pb-6">
        {!showDashboard || !dataLoaded ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 sm:gap-8">
            <div className="text-center px-4">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🐦</div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-200 mb-2">
                Pigeon Detection Station
              </h2>
              <p className="text-gray-500 text-sm sm:text-base max-w-md">
                Connect a camera to start detecting and identifying individual pigeons.
                Track visit frequency over time and map social relationships.
              </p>
            </div>
            <CameraSetup onConnect={handleConnect} />
          </div>
        ) : (
          <>
            {/* Desktop tab bar (hidden on mobile — tabs move to bottom) */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-900/60 rounded-xl p-1 mb-6">
              {tabs.map((tab) => (
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
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-500'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'live' && (
              <div className="space-y-4 sm:space-y-6">
                {cameraConfig ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="lg:col-span-2">
                      <div className="bg-gray-800/50 rounded-xl p-6 sm:p-8 border border-gray-700/50 text-center">
                        <p className="text-gray-400 mb-4 text-sm">
                          Camera not connected. Connect one to resume live detection.
                        </p>
                        <CameraSetup onConnect={handleConnect} />
                      </div>
                    </div>
                    <div>
                      <StatsPanel stats={stats} />
                    </div>
                  </div>
                )}
                <SightingLog sightings={sightings} />
              </div>
            )}

            {activeTab === 'visits' && (
              <div className="space-y-4 sm:space-y-6">
                <StatsPanel stats={stats} />
                <VisitTimeline visits={visits} registry={registry} />
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-4 sm:space-y-6">
                <SocialNetwork coOccurrences={coOccurrences} registry={registry} />
              </div>
            )}

            {activeTab === 'registry' && (
              <div className="space-y-4 sm:space-y-6">
                <PigeonRegistry registry={registry} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile bottom tab bar (iOS-native style) */}
      {showDashboard && dataLoaded && (
        <nav
          className="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-md border-t border-gray-800/60 z-20"
          style={{ paddingBottom: 'var(--sab)' }}
        >
          <div className="flex items-stretch">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${
                  activeTab === tab.id ? 'text-green-400' : 'text-gray-500'
                }`}
              >
                <span className="text-base leading-none">{TAB_ICONS[tab.id]}</span>
                <span className="text-[10px] font-medium">{tab.shortLabel}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[8px] px-1 rounded-full absolute top-1 ${
                    activeTab === tab.id ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
