import { useState } from 'react';
import type { CameraConfig } from '../types/pigeon';

interface CameraSetupProps {
  onConnect: (config: CameraConfig) => void;
}

export function CameraSetup({ onConnect }: CameraSetupProps) {
  const [tab, setTab] = useState<'webcam' | 'ip' | 'url'>('webcam');
  const [url, setUrl] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(2000);

  return (
    <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold text-gray-200 mb-2 text-center">
        Connect a Camera
      </h2>
      <p className="text-gray-500 text-sm text-center mb-6">
        Choose a video source to start monitoring for pigeons
      </p>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900/60 rounded-lg p-1 mb-6">
        {[
          { id: 'webcam' as const, label: 'Webcam' },
          { id: 'ip' as const, label: 'IP Camera' },
          { id: 'url' as const, label: 'Image URL' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors ${
              tab === t.id
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'webcam' && (
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">
            Use your computer's built-in webcam or a USB camera.
            You'll be asked for camera permissions.
          </p>
          <button
            onClick={() => onConnect({ type: 'webcam' })}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Start Webcam
          </button>
        </div>
      )}

      {tab === 'ip' && (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Enter the snapshot URL of your IP camera (usually ends in /snapshot.jpg or /cgi-bin/snapshot.cgi).
          </p>
          <input
            type="url"
            placeholder="http://192.168.1.100/snapshot.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-green-500 focus:outline-none"
          />
          <div>
            <label className="text-gray-500 text-xs">
              Refresh interval: {refreshInterval / 1000}s
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
              url && onConnect({ type: 'ip-camera', url, refreshInterval })
            }
            disabled={!url}
            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            Connect
          </button>
        </div>
      )}

      {tab === 'url' && (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Paste a direct link to an image containing pigeons.
            Great for testing the detection system.
          </p>
          <input
            type="url"
            placeholder="https://example.com/pigeons.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-green-500 focus:outline-none"
          />
          <button
            onClick={() =>
              url && onConnect({ type: 'image-url', url, refreshInterval: 5000 })
            }
            disabled={!url}
            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            Load Image
          </button>
        </div>
      )}
    </div>
  );
}
