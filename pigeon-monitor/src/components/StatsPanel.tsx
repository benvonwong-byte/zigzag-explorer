import type { AppStats } from '../types/pigeon';

interface StatsPanelProps {
  stats: AppStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const maxCount = Math.max(...stats.hourlyCounts, 1);

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">Statistics</h2>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Unique Pigeons" value={stats.uniquePigeons} accent="text-green-400" />
        <StatCard label="Total Visits" value={stats.totalVisits} accent="text-blue-400" />
        <StatCard label="Today's Visits" value={stats.todayVisits} accent="text-yellow-400" />
        <StatCard label="Total Detections" value={stats.totalDetections} />
        <StatCard label="Today Sightings" value={stats.todaySightings} />
        <StatCard
          label="Peak Hour"
          value={
            stats.peakHour !== null
              ? `${stats.peakHour.toString().padStart(2, '0')}:00`
              : '\u2014'
          }
        />
      </div>

      {/* Hourly activity chart */}
      <div>
        <h3 className="text-sm text-gray-400 mb-2">Today's Hourly Activity</h3>
        <div className="flex items-end gap-px h-20">
          {stats.hourlyCounts.map((count, hour) => {
            const currentHour = new Date().getHours();
            const isCurrent = hour === currentHour;
            return (
              <div key={hour} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className={`w-full rounded-t transition-all ${
                    isCurrent ? 'bg-green-400/80' : 'bg-green-500/50'
                  }`}
                  style={{
                    height: `${(count / maxCount) * 100}%`,
                    minHeight: count > 0 ? '2px' : '0',
                  }}
                  title={`${hour.toString().padStart(2, '0')}:00 — ${count} sighting${count !== 1 ? 's' : ''}`}
                />
                {hour % 6 === 0 && (
                  <span className="text-[9px] text-gray-600">
                    {hour.toString().padStart(2, '0')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div className="bg-gray-900/40 rounded-lg p-3">
      <p className="text-gray-500 text-xs">{label}</p>
      <p className={`text-lg font-bold mt-0.5 ${accent || 'text-gray-200'}`}>{value}</p>
    </div>
  );
}
