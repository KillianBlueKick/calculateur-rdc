const FIELDS = [
  { id: 'price', label: 'Prix par carton (€)', step: 1 },
  { id: 'capacity', label: 'Capacité conteneur (cartons)', step: 1 },
  { id: 'containers', label: 'Conteneurs par mois', step: 0.5 },
  { id: 'sold', label: 'Cartons vendus (simulation)', step: 10 },
];

const QUICK_FILLS = [
  { label: 'Seuil', val: 'be' },
  { label: '50%', val: 50 },
  { label: '80%', val: 80 },
  { label: 'Plein', val: 100 },
];

export default function GlobalParams({ globals, fillPct, cartonsSold, breakEvenCartons, onUpdate, onQuickFill }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 mb-3">
      <h3 className="text-sm font-medium mb-3">Paramètres globaux</h3>
      {FIELDS.map((field) => (
        <div key={field.id} className="flex justify-between items-center py-1.5">
          <span className="text-sm">{field.label}</span>
          <input
            type="number"
            value={globals[field.id]}
            step={field.step}
            min={0}
            onChange={(e) => onUpdate(field.id, e.target.value)}
            className="w-24 px-2 py-1.5 text-sm text-right border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
      ))}
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
      <p className="text-sm text-slate-500 mt-3">
        Remplissage : <span className="font-medium text-slate-700">{Math.round(fillPct)}%</span>{' '}
        ({cartonsSold}/{globals.capacity} cartons)
      </p>
    </div>
  );
}
