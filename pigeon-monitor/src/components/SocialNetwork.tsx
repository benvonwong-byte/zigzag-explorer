import { useRef, useEffect, useMemo, useState } from 'react';
import type { CoOccurrence, PigeonProfile } from '../types/pigeon';

interface SocialNetworkProps {
  coOccurrences: Map<string, CoOccurrence>;
  registry: Map<string, PigeonProfile>;
}

interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  sightings: number;
  color: string;
}

interface Edge {
  source: string;
  target: string;
  weight: number;
}

const COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
  '#a78bfa', '#fb923c', '#2dd4bf', '#f472b6', '#facc15',
];

export function SocialNetwork({ coOccurrences, registry }: SocialNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const prevNodesRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const hoveredRef = useRef(hoveredNode);
  useEffect(() => { hoveredRef.current = hoveredNode; }, [hoveredNode]);

  const { nodes, edges } = useMemo(() => {
    const pigeonIds = new Set<string>();
    const edgeList: Edge[] = [];

    for (const co of coOccurrences.values()) {
      pigeonIds.add(co.pigeonA);
      pigeonIds.add(co.pigeonB);
      edgeList.push({ source: co.pigeonA, target: co.pigeonB, weight: co.count });
    }

    // Include all registered pigeons (even without co-occurrences)
    for (const [id] of registry) {
      pigeonIds.add(id);
    }

    const nodeList: Node[] = [];
    let i = 0;
    for (const id of pigeonIds) {
      const pigeon = registry.get(id);
      if (!pigeon) continue;

      const prev = prevNodesRef.current.get(id);
      nodeList.push({
        id,
        name: pigeon.name,
        x: prev?.x ?? 220 + Math.cos(i * 2.4) * 100 + (Math.random() - 0.5) * 40,
        y: prev?.y ?? 170 + Math.sin(i * 2.4) * 100 + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        sightings: pigeon.sightingCount,
        color: COLORS[i % COLORS.length],
      });
      i++;
    }

    return { nodes: nodeList, edges: edgeList };
  }, [coOccurrences, registry]);

  // Force simulation + rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    const nodeMap = new Map<string, Node>();
    for (const n of nodes) nodeMap.set(n.id, n);

    let tick = 0;
    const maxTicks = 250;

    function simulate() {
      const alpha = Math.max(0, 1 - tick / maxTicks);
      tick++;

      // Center gravity
      for (const n of nodes) {
        n.vx += (cx - n.x) * 0.003 * alpha;
        n.vy += (cy - n.y) * 0.003 * alpha;
      }

      // Repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (100 * alpha) / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          nodes[i].vx -= fx;
          nodes[i].vy -= fy;
          nodes[j].vx += fx;
          nodes[j].vy += fy;
        }
      }

      // Edge attraction
      for (const edge of edges) {
        const src = nodeMap.get(edge.source);
        const tgt = nodeMap.get(edge.target);
        if (!src || !tgt) continue;
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const strength = Math.min(edge.weight, 5);
        const force = (dist - 70) * 0.004 * alpha * strength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        src.vx += fx;
        src.vy += fy;
        tgt.vx -= fx;
        tgt.vy -= fy;
      }

      // Apply velocity
      for (const n of nodes) {
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x += n.vx;
        n.y += n.vy;
        n.x = Math.max(40, Math.min(W - 40, n.x));
        n.y = Math.max(40, Math.min(H - 40, n.y));
      }

      // Store positions for reuse
      const posMap = new Map<string, { x: number; y: number }>();
      for (const n of nodes) posMap.set(n.id, { x: n.x, y: n.y });
      prevNodesRef.current = posMap;
    }

    function render() {
      ctx!.clearRect(0, 0, W, H);

      const maxWeight = Math.max(...edges.map(e => e.weight), 1);

      // Draw edges
      for (const edge of edges) {
        const src = nodeMap.get(edge.source);
        const tgt = nodeMap.get(edge.target);
        if (!src || !tgt) continue;

        const thickness = 1 + (edge.weight / maxWeight) * 5;
        const opacity = 0.15 + (edge.weight / maxWeight) * 0.5;

        ctx!.beginPath();
        ctx!.moveTo(src.x, src.y);
        ctx!.lineTo(tgt.x, tgt.y);
        ctx!.strokeStyle = `rgba(100, 200, 150, ${opacity})`;
        ctx!.lineWidth = thickness;
        ctx!.stroke();

        // Edge weight label
        if (edge.weight >= 2) {
          const mx = (src.x + tgt.x) / 2;
          const my = (src.y + tgt.y) / 2;
          ctx!.font = '10px monospace';
          ctx!.fillStyle = `rgba(150, 200, 170, ${opacity})`;
          ctx!.textAlign = 'center';
          ctx!.fillText(`${edge.weight}x`, mx, my - 5);
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const radius = 8 + Math.min(node.sightings, 50) * 0.4;
        const isHovered = hoveredRef.current === node.id;

        if (isHovered) {
          ctx!.beginPath();
          ctx!.arc(node.x, node.y, radius + 8, 0, Math.PI * 2);
          ctx!.fillStyle = `${node.color}33`;
          ctx!.fill();
        }

        ctx!.beginPath();
        ctx!.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx!.fillStyle = isHovered ? node.color : `${node.color}bb`;
        ctx!.fill();
        ctx!.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx!.lineWidth = 1;
        ctx!.stroke();

        ctx!.font = '11px system-ui, -apple-system, sans-serif';
        ctx!.fillStyle = '#d1d5db';
        ctx!.textAlign = 'center';
        ctx!.fillText(node.name, node.x, node.y + radius + 14);
      }
    }

    function loop() {
      if (tick <= maxTicks) simulate();
      render();
      animRef.current = requestAnimationFrame(loop);
    }

    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, [nodes, edges]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    let found: string | null = null;
    for (const node of nodes) {
      const dx = mx - node.x;
      const dy = my - node.y;
      const radius = 8 + Math.min(node.sightings, 50) * 0.4;
      if (dx * dx + dy * dy < (radius + 8) * (radius + 8)) {
        found = node.id;
        break;
      }
    }
    setHoveredNode(found);
  };

  if (registry.size === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-gray-200 mb-3">Social Network</h2>
        <p className="text-gray-500 text-sm">
          No pigeons detected yet. When multiple pigeons are seen together,
          their relationships will appear here.
        </p>
      </div>
    );
  }

  if (coOccurrences.size === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-gray-200 mb-3">Social Network</h2>
        <p className="text-gray-500 text-sm mb-3">
          No co-occurrences recorded yet. When multiple pigeons appear in the
          same frame, their connections will be mapped here.
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from(registry.values()).slice(0, 10).map((p, i) => (
            <span
              key={p.id}
              className="text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: `${COLORS[i % COLORS.length]}22`,
                color: COLORS[i % COLORS.length],
              }}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const topPairs = [...coOccurrences.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">
        Social Network
        <span className="ml-2 text-sm text-gray-500 font-normal">
          ({coOccurrences.size} connection{coOccurrences.size !== 1 ? 's' : ''})
        </span>
      </h2>

      <canvas
        ref={canvasRef}
        width={440}
        height={340}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
        className="w-full bg-gray-900/40 rounded-lg cursor-crosshair"
        style={{ aspectRatio: '440/340' }}
      />

      {topPairs.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-700/30">
          <h3 className="text-sm text-gray-400 mb-2">Strongest Bonds</h3>
          <div className="space-y-1.5">
            {topPairs.map((pair) => {
              const a = registry.get(pair.pigeonA);
              const b = registry.get(pair.pigeonB);
              return (
                <div
                  key={pair.pairKey}
                  className="flex items-center gap-2 text-xs bg-gray-900/40 rounded-lg px-3 py-2"
                >
                  <span className="text-green-400 font-medium">{a?.name || pair.nameA}</span>
                  <span className="text-gray-600">&</span>
                  <span className="text-blue-400 font-medium">{b?.name || pair.nameB}</span>
                  <span className="text-gray-600 ml-auto">
                    seen together {pair.count}x
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
