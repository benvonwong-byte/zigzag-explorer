import type { SightingEvent } from '../types/pigeon';

interface SightingLogProps {
  sightings: SightingEvent[];
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function SightingLog({ sightings }: SightingLogProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
      <h2 className="text-lg font-semibold text-gray-200 mb-3">
        Sighting Log
        <span className="ml-2 text-sm text-gray-500 font-normal">
          (last {Math.min(sightings.length, 50)})
        </span>
      </h2>
      {sightings.length === 0 ? (
        <p className="text-gray-500 text-sm">No sightings recorded yet.</p>
      ) : (
        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
          {sightings.slice(0, 50).map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 bg-gray-900/40 rounded-lg px-3 py-2 text-sm"
            >
              {s.snapshot && (
                <img
                  src={s.snapshot}
                  alt=""
                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                />
              )}
              <span className="text-green-400 font-medium flex-shrink-0">{s.pigeonName}</span>
              <span className="text-gray-600 text-xs ml-auto flex-shrink-0">
                {formatTime(s.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
