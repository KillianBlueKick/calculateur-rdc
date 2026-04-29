export default function ContainerWidget({ cartonsSold, capacity, usedVol, containerVol }) {
  const fillRatio = containerVol > 0 ? Math.min(usedVol / containerVol, 1) : 0;
  const pct = Math.round(fillRatio * 100);

  const W = 400;
  const H = 110;
  const bodyX = 10;
  const bodyY = 14;
  const bodyW = W - 60;
  const bodyH = H - 28;
  const r = 6;
  const fillW = Math.round(bodyW * fillRatio);

  const stripeCount = 18;
  const stripes = Array.from({ length: stripeCount }, (_, i) =>
    bodyX + Math.round((bodyW / stripeCount) * (i + 0.5))
  );

  return (
    <div className="bg-slate-50 rounded-lg p-4">
      <p className="text-xs text-slate-500 mb-2">Remplissage du conteneur</p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 120 }}>
        {/* Shadow */}
        <rect x={bodyX + 3} y={bodyY + 3} width={bodyW} height={bodyH} rx={r} fill="#00000015" />

        {/* Empty zone (red) */}
        <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} rx={r} fill="#fca5a5" />

        {/* Filled zone (green) */}
        {fillW > 0 && (
          <>
            <clipPath id="fillClip">
              <rect x={bodyX} y={bodyY} width={fillW} height={bodyH} />
            </clipPath>
            <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} rx={r} fill="#6ee7b7" clipPath="url(#fillClip)" />
          </>
        )}

        {/* Corrugation stripes */}
        {stripes.map((sx, i) => (
          <line key={i} x1={sx} y1={bodyY} x2={sx} y2={bodyY + bodyH} stroke="#00000012" strokeWidth="1.5" />
        ))}

        {/* Fill divider */}
        {fillW > 4 && fillW < bodyW - 4 && (
          <line x1={bodyX + fillW} y1={bodyY + 4} x2={bodyX + fillW} y2={bodyY + bodyH - 4}
            stroke="white" strokeWidth="2.5" strokeDasharray="4,3" opacity="0.8" />
        )}

        {/* Outline */}
        <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} rx={r} fill="none" stroke="#94a3b8" strokeWidth="1.5" />

        {/* Door */}
        <rect x={bodyX + bodyW - 28} y={bodyY} width={28} height={bodyH} rx={r} fill="none" stroke="#94a3b8" strokeWidth="1.5" />
        <rect x={bodyX + bodyW - 17} y={bodyY + bodyH / 2 - 8} width={4} height={16} rx={2} fill="#94a3b8" />

        {/* Chassis */}
        <rect x={bodyX + 8} y={bodyY + bodyH} width={bodyW - 36} height={6} rx={2} fill="#94a3b8" />

        {/* Wheels */}
        {[bodyX + 30, bodyX + bodyW - 68].map((wx, i) => (
          <g key={i}>
            <circle cx={wx} cy={bodyY + bodyH + 10} r={8} fill="#64748b" />
            <circle cx={wx} cy={bodyY + bodyH + 10} r={4} fill="#94a3b8" />
          </g>
        ))}

        {/* % label */}
        <text
          x={bodyX + (bodyW - 28) / 2} y={bodyY + bodyH / 2 + 5}
          textAnchor="middle" fontSize="18" fontWeight="700"
          fill={fillRatio > 0.5 ? '#065f46' : fillRatio > 0.2 ? '#92400e' : '#991b1b'}
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          {pct}%
        </text>

        {/* Truck */}
        <text x={W - 42} y={bodyY + bodyH / 2 + 5} textAnchor="middle" fontSize="22">🚛</text>
      </svg>

      {/* m³ info */}
      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="text-slate-500">
          Volume occupé :
          <span className="font-semibold text-slate-700 ml-1">{usedVol.toFixed(1)} m³</span>
          <span className="text-slate-400 ml-1">/ {containerVol.toFixed(1)} m³ totaux</span>
        </span>
        <span className="text-slate-400">{cartonsSold} cartons</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: fillRatio >= 1 ? '#10b981' : fillRatio > 0.5 ? '#34d399' : fillRatio > 0.25 ? '#fbbf24' : '#f87171',
          }}
        />
      </div>
    </div>
  );
}
