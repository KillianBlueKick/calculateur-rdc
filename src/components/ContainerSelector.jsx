import { CONTAINERS, getContainerVolume } from '../data/containers';

const QUICK_FILLS = [
  { label: 'Seuil', val: 'be'  },
  { label: '50%',   val: 50    },
  { label: '80%',   val: 80    },
  { label: 'Plein', val: 100   },
];

export default function ContainerSelector({
  value, onChange,
  globals, capacity, fillPct, cartonsSold, breakEvenCartons,
  onUpdateGlobal, onQuickFill,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 mb-3">
      <h3 className="text-sm font-medium mb-3">Taille du conteneur</h3>

      {/* Container type buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {Object.entries(CONTAINERS).map(([key, c]) => {
          const vol = getContainerVolume(key).toFixed(1);
          const active = value === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex flex-col items-center py-3 px-2 rounded-lg border-2 transition-colors ${
                active
                  ? 'border-slate-800 bg-slate-800 text-white'
                  : 'border-slate-200 hover:border-slate-400 text-slate-700'
              }`}
            >
              <svg viewBox="0 0 48 20" className={`w-10 mb-1.5 ${active ? 'opacity-90' : 'opacity-60'}`}>
                <rect x="1" y="3" width={key === '20' ? 28 : 46} height="14" rx="2"
                  fill={active ? '#94a3b8' : '#cbd5e1'} />
                <rect x={key === '20' ? 25 : 43} y="3" width="5" height="14" rx="1"
                  fill={active ? '#64748b' : '#94a3b8'} />
                {[0.25, 0.5, 0.75].map((p, i) => (
                  <line key={i}
                    x1={(key === '20' ? 28 : 46) * p + 1} y1="3"
                    x2={(key === '20' ? 28 : 46) * p + 1} y2="17"
                    stroke={active ? '#475569' : '#94a3b8'} strokeWidth="0.8" />
                ))}
                <circle cx={key === '20' ? 8  : 10} cy="19" r="2" fill={active ? '#94a3b8' : '#cbd5e1'} />
                <circle cx={key === '20' ? 22 : 38} cy="19" r="2" fill={active ? '#94a3b8' : '#cbd5e1'} />
              </svg>
              <span className="text-xs font-semibold leading-tight">{c.label}</span>
              <span className={`text-xs mt-0.5 ${active ? 'text-slate-300' : 'text-slate-400'}`}>{vol} m³</span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 mb-4 text-center">{CONTAINERS[value].sublabel} — intérieur utile</p>

      <div className="border-t border-slate-100 pt-3 space-y-2">
        {/* Conteneurs par mois */}
        <div className="flex justify-between items-center">
          <span className="text-sm">Conteneurs par mois</span>
          <input
            type="number"
            value={globals.containers}
            step={0.5}
            min={0}
            onChange={(e) => onUpdateGlobal('containers', e.target.value)}
            className="w-24 px-2 py-1.5 text-sm text-right border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {/* Cartons vendus */}
        <div className="flex justify-between items-center">
          <span className="text-sm">Cartons vendus (simulation)</span>
          <input
            type="number"
            value={globals.sold}
            step={10}
            min={0}
            max={capacity}
            onChange={(e) => onUpdateGlobal('sold', e.target.value)}
            className="w-24 px-2 py-1.5 text-sm text-right border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
      </div>

      {/* Quick fill buttons */}
      <div className="flex gap-1.5 mt-3">
        {QUICK_FILLS.map((b) => (
          <button
            key={b.label}
            onClick={() => onQuickFill(b.val)}
            className="flex-1 py-1.5 text-xs border border-slate-200 rounded-md hover:bg-slate-50 active:bg-slate-100 transition-colors font-medium"
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Fill info */}
      <p className="text-sm text-slate-500 mt-3">
        Remplissage : <span className="font-medium text-slate-700">{Math.round(fillPct)}%</span>{' '}
        ({cartonsSold}/{capacity} cartons)
      </p>
    </div>
  );
}
