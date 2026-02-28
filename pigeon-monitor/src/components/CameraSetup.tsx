import { useState } from 'react';
import type { CameraConfig } from '../types/pigeon';

interface CameraSetupProps {
  onConnect: (config: CameraConfig) => void;
}

const INTERVAL_OPTIONS = [
  { value: 3000, label: '3s', desc: 'Fast — higher accuracy, more battery' },
  { value: 5000, label: '5s', desc: 'Balanced (recommended)' },
  { value: 10000, label: '10s', desc: 'Efficient — good for all-day monitoring' },
  { value: 30000, label: '30s', desc: 'Low power — catches most visits' },
  { value: 60000, label: '60s', desc: 'Minimal — for multi-day battery life' },
];

export function CameraSetup({ onConnect }: CameraSetupProps) {
  const [tab, setTab] = useState<'webcam' | 'ip' | 'url'>('webcam');
  const [url, setUrl] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(2000);
  const [captureInterval, setCaptureInterval] = useState(5000);

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 sm:p-8 border border-gray-700/50 max-w-lg mx-auto w-full">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-200 mb-2 text-center">
        Connect a Camera
      </h2>
      <p className="text-gray-500 text-xs sm:text-sm text-center mb-5">
        Choose a source and capture frequency
      </p>

      {/* Source tabs */}
      <div className="flex gap-1 bg-gray-900/60 rounded-lg p-1 mb-5">
        {[
          { id: 'webcam' as const, label: 'Camera' },
          { id: 'ip' as const, label: 'IP Camera' },
          { id: 'url' as const, label: 'Image URL' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors min-h-[40px] ${
              tab === t.id
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Capture interval selector (shown for all source types) */}
      <div className="mb-5 bg-gray-900/40 rounded-lg p-4">
        <label className="text-gray-400 text-xs font-medium block mb-2">
          Capture interval
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {INTERVAL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCaptureInterval(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[32px] ${
                captureInterval === opt.value
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-gray-600 text-[10px] mt-2">
          {INTERVAL_OPTIONS.find(o => o.value === captureInterval)?.desc}
          {' \u2014 '}skips frames with no motion to save battery
        </p>
      </div>

      {tab === 'webcam' && (
        <div className="text-center">
          <p className="text-gray-400 text-xs sm:text-sm mb-4">
            Uses your device's camera. On phones, the rear camera is selected automatically.
          </p>
          <button
            onClick={() => onConnect({ type: 'webcam', captureInterval })}
            className="bg-green-600 active:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors min-h-[44px]"
          >
            Start Camera
          </button>
        </div>
      )}

      {tab === 'ip' && (
        <div className="space-y-4">
          <p className="text-gray-400 text-xs sm:text-sm">
            Enter the snapshot URL of your IP camera.
          </p>
          <input
            type="url"
            placeholder="http://192.168.1.100/snapshot.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-green-500 focus:outline-none min-h-[44px]"
          />
          <div>
            <label className="text-gray-500 text-xs">
              Image refresh: {refreshInterval / 1000}s
            </label>
            <input
              type="range"
              min={500}
              max={10000}
              step={500}
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="w-full mt-1"
            />
          </div>
          <button
            onClick={() =>
              url && onConnect({ type: 'ip-camera', url, refreshInterval, captureInterval })
            }
            disabled={!url}
            className="w-full bg-green-600 active:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2.5 rounded-lg font-medium transition-colors min-h-[44px]"
          >
            Connect
          </button>
        </div>
      )}

      {tab === 'url' && (
        <div className="space-y-4">
          <p className="text-gray-400 text-xs sm:text-sm">
            Paste a direct link to an image with pigeons. Great for testing.
          </p>
          <input
            type="url"
            placeholder="https://example.com/pigeons.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-green-500 focus:outline-none min-h-[44px]"
          />
          <button
            onClick={() =>
              url && onConnect({ type: 'image-url', url, refreshInterval: 5000, captureInterval })
            }
            disabled={!url}
            className="w-full bg-green-600 active:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2.5 rounded-lg font-medium transition-colors min-h-[44px]"
          >
            Load Image
          </button>
        </div>
      )}
    </div>
  );
}
