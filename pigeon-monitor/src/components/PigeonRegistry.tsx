import type { PigeonProfile } from '../types/pigeon';

interface PigeonRegistryProps {
  registry: Map<string, PigeonProfile>;
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function PigeonRegistry({ registry }: PigeonRegistryProps) {
  const pigeons = Array.from(registry.values()).sort(
    (a, b) => b.lastSeen - a.lastSeen
  );

  if (pigeons.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-gray-200 mb-3">Pigeon Registry</h2>
        <p className="text-gray-500 text-sm">
          No pigeons identified yet. Start scanning to build your registry.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">
        Pigeon Registry
        <span className="ml-2 text-sm text-gray-500 font-normal">
          ({pigeons.length} individual{pigeons.length !== 1 ? 's' : ''})
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
        {pigeons.map((pigeon) => (
          <PigeonCard key={pigeon.id} pigeon={pigeon} />
        ))}
      </div>
    </div>
  );
}

function PigeonCard({ pigeon }: { pigeon: PigeonProfile }) {
  const latestSnapshot = pigeon.snapshots[pigeon.snapshots.length - 1];

  return (
    <div className="flex gap-3 bg-gray-900/60 rounded-lg p-3 border border-gray-700/30 hover:border-green-500/30 transition-colors">
      {latestSnapshot && (
        <img
          src={latestSnapshot}
          alt={pigeon.name}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
      )}
      <div className="min-w-0 flex-1">
        <h3 className="text-green-400 font-semibold text-sm truncate">{pigeon.name}</h3>
        <p className="text-gray-500 text-xs mt-0.5">
          Seen {pigeon.sightingCount} time{pigeon.sightingCount !== 1 ? 's' : ''}
        </p>
        <p className="text-gray-600 text-xs mt-0.5">
          Last: {formatTimeAgo(pigeon.lastSeen)}
        </p>
      </div>
    </div>
  );
}
