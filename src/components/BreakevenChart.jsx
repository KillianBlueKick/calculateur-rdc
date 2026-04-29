const W = 480;
const H = 180;
const PAD = { top: 16, right: 16, bottom: 32, left: 52 };
const IW = W - PAD.left - PAD.right;
const IH = H - PAD.top - PAD.bottom;

function fmt(n) {
  if (Math.abs(n) >= 1000) return '€' + Math.round(n / 1000) + 'k';
  return '€' + Math.round(n);
}

export default function BreakevenChart({ capacity, price, totalCost, cartonsSold, breakEvenCartons }) {
  if (!capacity || !price) return null;

  // Build profit curve: profit(x) = x * price - totalCost
  const steps = 20;
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const x = Math.round((capacity / steps) * i);
    return { x, y: x * price - totalCost };
  });

  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y));
  const yRange = maxY - minY || 1;

  const toSvgX = (x) => PAD.left + (x / capacity) * IW;
  const toSvgY = (y) => PAD.top + ((maxY - y) / yRange) * IH;

  const zeroY = toSvgY(0);
  const beX = toSvgX(Math.min(breakEvenCartons, capacity));
  const currentX = toSvgX(Math.min(cartonsSold, capacity));
  const currentY = toSvgY(cartonsSold * price - totalCost);

  // Split polyline into loss and profit segments around breakeven
  const lossPoints = points.filter((p) => p.x <= breakEvenCartons);
  const gainPoints = points.filter((p) => p.x >= breakEvenCartons);

  const toPolyStr = (pts) =>
    pts.map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(' ');

  // Y-axis labels (3 ticks)
  const yTicks = [minY, (minY + maxY) / 2, maxY].map((v) => ({
    label: fmt(v),
    y: toSvgY(v),
  }));

  // X-axis labels
  const xTicks = [0, Math.round(capacity / 2), capacity].map((v) => ({
    label: v,
    x: toSvgX(v),
  }));

  const isProfit = cartonsSold * price - totalCost >= 0;

  return (
    <div className="bg-slate-50 rounded-lg p-4">
      <p className="text-xs text-slate-500 mb-2">Courbe de rentabilité</p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ maxHeight: 200 }}
        aria-label="Graphique de rentabilité"
      >
        {/* Zero line */}
        {zeroY >= PAD.top && zeroY <= H - PAD.bottom && (
          <line
            x1={PAD.left} y1={zeroY} x2={W - PAD.right} y2={zeroY}
            stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,3"
          />
        )}

        {/* Loss curve (red) */}
        {lossPoints.length >= 2 && (
          <polyline
            points={toPolyStr(lossPoints)}
            fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinejoin="round"
          />
        )}

        {/* Gain curve (green) */}
        {gainPoints.length >= 2 && (
          <polyline
            points={toPolyStr(gainPoints)}
            fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round"
          />
        )}

        {/* Breakeven vertical line */}
        {breakEvenCartons <= capacity && (
          <line
            x1={beX} y1={PAD.top} x2={beX} y2={H - PAD.bottom}
            stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3"
          />
        )}

        {/* Current position marker */}
        <circle
          cx={currentX} cy={currentY} r="5"
          fill={isProfit ? '#10b981' : '#ef4444'}
          stroke="white" strokeWidth="2"
        />

        {/* Y-axis ticks */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PAD.left - 4} y1={t.y} x2={PAD.left} y2={t.y} stroke="#cbd5e1" strokeWidth="1" />
            <text x={PAD.left - 6} y={t.y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">
              {t.label}
            </text>
          </g>
        ))}

        {/* X-axis ticks */}
        {xTicks.map((t, i) => (
          <g key={i}>
            <line x1={t.x} y1={H - PAD.bottom} x2={t.x} y2={H - PAD.bottom + 4} stroke="#cbd5e1" strokeWidth="1" />
            <text x={t.x} y={H - PAD.bottom + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">
              {t.label}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#e2e8f0" strokeWidth="1" />

        {/* X-axis label */}
        <text x={W / 2} y={H} textAnchor="middle" fontSize="9" fill="#94a3b8">cartons vendus</text>
      </svg>
    </div>
  );
}
