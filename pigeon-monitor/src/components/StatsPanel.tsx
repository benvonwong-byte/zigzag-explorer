import type { AppStats } from '../types/pigeon';

interface StatsPanelProps {
  stats: AppStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const maxCount = Math.max(...stats.hourlyCounts, 1);

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">Statistics</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard label="Total Detections" value={stats.totalDetections} />
        <StatCard label="Unique Pigeons" value={stats.uniquePigeons} />
        <StatCard label="Today's Sightings" value={stats.todaySightings} />
        <StatCard
          label="Peak Hour"
          value={
            stats.peakHour !== null
              ? `${stats.peakHour.toString().padStart(2, '0')}:00`
              : '—'
          }
        />
      </div>

      {/* Hourly activity chart */}
      <div>
        <h3 className="text-sm text-gray-400 mb-2">Hourly Activity</h3>
        <div className="flex items-end gap-px h-20">
          {stats.hourlyCounts.map((count, hour) => (
            <div key={hour} className="flex-1 flex flex-col items-center gap-0.5">
              <div
                className="w-full bg-green-500/60 rounded-t transition-all"
                style={{
                  height: `${(count / maxCount) * 100}%`,
                  minHeight: count > 0 ? '2px' : '0',
                }}
              />
              {hour % 6 === 0 && (
                <span className="text-[9px] text-gray-600">
                  {hour.toString().padStart(2, '0')}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-gray-900/40 rounded-lg p-3">
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="text-xl font-bold text-gray-200 mt-1">{value}</p>
    </div>
  );
}
