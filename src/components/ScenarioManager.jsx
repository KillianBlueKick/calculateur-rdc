import { useState } from 'react';
import { Save, Trash2, FolderOpen } from 'lucide-react';

const fmt = (n) => '€' + Math.round(n).toLocaleString('fr-BE');

function profitColor(profit) {
  if (profit > 0) return 'text-emerald-600';
  if (profit < 0) return 'text-red-600';
  return 'text-slate-500';
}

export default function ScenarioManager({ scenarios, profit, onSave, onLoad, onDelete }) {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const label = name.trim() || `Scénario ${scenarios.length + 1}`;
    const ok = onSave(label);
    if (ok) {
      setName('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 mb-3">
      <h3 className="text-sm font-medium mb-3">Scénarios sauvegardés</h3>

      {/* Save current */}
      {scenarios.length < 3 && (
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Nom du scénario…"
            className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-800 text-white rounded-md hover:bg-slate-700 active:bg-slate-900 transition-colors"
          >
            {saved ? '✓ Sauvegardé' : <><Save size={12} /> Sauvegarder</>}
          </button>
        </div>
      )}

      {scenarios.length === 0 && (
        <p className="text-xs text-slate-400 italic">
          Aucun scénario — sauvegardez la configuration actuelle pour la comparer plus tard.
        </p>
      )}

      {scenarios.map((s, idx) => {
        const scenarioProfit = s.state
          ? (() => {
              const { fees, custom, globals, cartonFormats = [] } = s.state;
              const sumCat = (cat) =>
                fees[cat].filter((f) => f.enabled).reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
              const variable = sumCat('belgique') + sumCat('maritime') + sumCat('rdc') +
                custom.filter((f) => f.enabled && !f.isMonthly).reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
              const fixed = (sumCat('fixes') + custom.filter((f) => f.enabled && f.isMonthly).reduce((acc, f) => acc + (Number(f.amount) || 0), 0)) / Math.max(globals.containers, 0.1);
              const total = variable + fixed;
              const capacity = cartonFormats.reduce((acc, f) => acc + f.qty, 0) || globals.capacity || 0;
              const sold = Math.min(globals.sold, capacity);
              return sold * globals.price - total;
            })()
          : 0;

        return (
          <div key={idx} className="flex items-center gap-2 py-2 border-b border-slate-100 last:border-0">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{s.name}</p>
              <p className={`text-xs ${profitColor(scenarioProfit)}`}>{fmt(scenarioProfit)}</p>
            </div>
            <button
              onClick={() => onLoad(idx)}
              className="text-slate-400 hover:text-slate-700 p-1"
              title="Charger ce scénario"
            >
              <FolderOpen size={14} />
            </button>
            <button
              onClick={() => onDelete(idx)}
              className="text-slate-400 hover:text-red-500 p-1"
              title="Supprimer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}

      {scenarios.length >= 3 && (
        <p className="text-xs text-slate-400 mt-2">Maximum 3 scénarios — supprimez-en un pour continuer.</p>
      )}
    </div>
  );
}
