import { useMemo, useState } from 'react';
import type { Visit, PigeonProfile } from '../types/pigeon';

interface VisitTimelineProps {
  visits: Visit[];
  registry: Map<string, PigeonProfile>;
}

type TimeRange = '24h' | '7d' | '30d' | 'all';

const COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
  '#a78bfa', '#fb923c', '#2dd4bf', '#f472b6', '#facc15',
];

export function VisitTimeline({ visits, registry }: VisitTimelineProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const { filteredVisits, pigeonRows, timeLabels, bucketCount } = useMemo(() => {
    const now = Date.now();
    let cutoff: number;
    let buckets: number;
    let labelFn: (i: number) => string;

    switch (timeRange) {
      case '24h':
        cutoff = now - 24 * 60 * 60 * 1000;
        buckets = 24;
        labelFn = (i) => `${i}:00`;
        break;
      case '7d':
        cutoff = now - 7 * 24 * 60 * 60 * 1000;
        buckets = 7;
        labelFn = (i) => {
          const d = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
          return d.toLocaleDateString([], { weekday: 'short' });
        };
        break;
      case '30d':
        cutoff = now - 30 * 24 * 60 * 60 * 1000;
        buckets = 30;
        labelFn = (i) => {
          const d = new Date(now - (29 - i) * 24 * 60 * 60 * 1000);
          return d.getDate().toString();
        };
        break;
      case 'all':
      default: {
        if (visits.length === 0) {
          cutoff = now - 7 * 24 * 60 * 60 * 1000;
          buckets = 7;
          labelFn = (i) => {
            const d = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
            return d.toLocaleDateString([], { weekday: 'short' });
          };
        } else {
          const oldest = Math.min(...visits.map(v => v.startTime));
          cutoff = oldest;
          const daySpan = Math.max(1, Math.ceil((now - oldest) / (24 * 60 * 60 * 1000)));
          buckets = Math.min(daySpan, 60);
          labelFn = (i) => {
            const d = new Date(cutoff + (i * (now - cutoff)) / buckets);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          };
        }
        break;
      }
    }

    const filtered = visits.filter(v => v.startTime >= cutoff);
    const bucketDuration = (now - cutoff) / buckets;

    // Group visits by pigeon, count per bucket
    const byPigeon = new Map<string, number[]>();
    for (const v of filtered) {
      if (!byPigeon.has(v.pigeonId)) {
        byPigeon.set(v.pigeonId, new Array(buckets).fill(0));
      }
      const bucketIdx = Math.min(
        buckets - 1,
        Math.floor((v.startTime - cutoff) / bucketDuration)
      );
      byPigeon.get(v.pigeonId)![bucketIdx]++;
    }

    // Sort by total visits descending
    const sorted = [...byPigeon.entries()].sort(
      (a, b) => b[1].reduce((s, c) => s + c, 0) - a[1].reduce((s, c) => s + c, 0)
    );

    const labels = Array.from({ length: buckets }, (_, i) => labelFn(i));

    return {
      filteredVisits: filtered,
      pigeonRows: sorted,
      timeLabels: labels,
      bucketCount: buckets,
    };
  }, [visits, timeRange]);

  if (registry.size === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-gray-200 mb-3">Visit Timeline</h2>
        <p className="text-gray-500 text-sm">
          No pigeons detected yet. Start scanning to see visit patterns.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-200">
          Visit Timeline
          <span className="ml-2 text-sm text-gray-500 font-normal">
            ({filteredVisits.length} visit{filteredVisits.length !== 1 ? 's' : ''})
          </span>
        </h2>
        <div className="flex gap-0.5 bg-gray-900/60 rounded-lg p-0.5">
          {(['24h', '7d', '30d', 'all'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {range === 'all' ? 'All' : range}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: Math.max(400, bucketCount * 20) }}>
          {/* Time labels row */}
          <div className="flex mb-1" style={{ marginLeft: '6rem' }}>
            {timeLabels.map((label, i) => {
              const showLabel = bucketCount <= 10 || i % Math.ceil(bucketCount / 10) === 0;
              return (
                <div
                  key={i}
                  className="text-[10px] text-gray-600 text-center"
                  style={{ width: `${100 / bucketCount}%` }}
                >
                  {showLabel ? label : ''}
                </div>
              );
            })}
          </div>

          {/* Pigeon rows */}
          {pigeonRows.slice(0, 15).map(([pigeonId, counts], rowIdx) => {
            const pigeon = registry.get(pigeonId);
            const maxCount = Math.max(...counts, 1);
            const color = COLORS[rowIdx % COLORS.length];

            return (
              <div key={pigeonId} className="flex items-center gap-2 mb-0.5">
                <div className="w-22 flex items-center gap-1.5 flex-shrink-0">
                  {pigeon?.snapshots[pigeon.snapshots.length - 1] && (
                    <img
                      src={pigeon.snapshots[pigeon.snapshots.length - 1]}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <span
                    className="text-xs font-medium truncate"
                    style={{ color }}
                  >
                    {pigeon?.name || 'Unknown'}
                  </span>
                </div>
                <div className="flex flex-1 gap-px">
                  {counts.map((count, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm transition-all"
                      style={{
                        height: '18px',
                        backgroundColor: count > 0
                          ? `${color}${Math.round((count / maxCount) * 180 + 40).toString(16).padStart(2, '0')}`
                          : 'rgba(255,255,255,0.03)',
                      }}
                      title={`${pigeon?.name}: ${count} visit${count !== 1 ? 's' : ''}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visit frequency bar chart */}
      <div className="mt-5 pt-4 border-t border-gray-700/30">
        <h3 className="text-sm text-gray-400 mb-3">Top Visitors</h3>
        <div className="space-y-2">
          {pigeonRows.slice(0, 10).map(([pigeonId, counts], idx) => {
            const pigeon = registry.get(pigeonId);
            const total = counts.reduce((s, c) => s + c, 0);
            const maxTotal = pigeonRows[0]?.[1].reduce((s: number, c: number) => s + c, 0) || 1;
            const color = COLORS[idx % COLORS.length];

            return (
              <div key={pigeonId} className="flex items-center gap-2">
                {pigeon?.snapshots[pigeon.snapshots.length - 1] && (
                  <img
                    src={pigeon.snapshots[pigeon.snapshots.length - 1]}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <span className="text-xs w-16 truncate font-medium" style={{ color }}>
                  {pigeon?.name}
                </span>
                <div className="flex-1 bg-gray-900/40 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all flex items-center pl-2"
                    style={{
                      width: `${Math.max((total / maxTotal) * 100, 8)}%`,
                      backgroundColor: `${color}99`,
                    }}
                  >
                    <span className="text-[10px] text-white font-medium">{total}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
