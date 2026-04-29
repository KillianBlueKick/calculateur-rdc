import { Plus, Trash2 } from 'lucide-react';

export default function CustomFees({ custom, onUpdate, onAdd, onRemove }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 mb-3">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium">Frais personnalisés</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-300 rounded-md hover:bg-slate-50 active:bg-slate-100 transition-colors"
        >
          <Plus size={12} /> Ajouter
        </button>
      </div>

      {custom.length === 0 && (
        <p className="text-xs text-slate-400 italic py-2">Aucun frais personnalisé</p>
      )}

      {custom.map((fee, idx) => (
        <div
          key={idx}
          className={`flex flex-wrap gap-2 items-center py-2 border-b border-slate-100 last:border-0 ${
            !fee.enabled ? 'opacity-40' : ''
          }`}
        >
          <input
            type="checkbox"
            checked={fee.enabled}
            onChange={(e) => onUpdate(idx, 'enabled', e.target.checked)}
            className="w-5 h-5 cursor-pointer accent-slate-700 shrink-0"
          />
          <input
            type="text"
            value={fee.label}
            onChange={(e) => onUpdate(idx, 'label', e.target.value)}
            className="flex-1 min-w-[120px] px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="number"
              value={fee.amount}
              onChange={(e) => onUpdate(idx, 'amount', Number(e.target.value) || 0)}
              className="w-20 px-2 py-1.5 text-sm text-right border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <span className="text-xs text-slate-400">€</span>
          </div>
          <button
            onClick={() => onUpdate(idx, 'isMonthly', !fee.isMonthly)}
            className="text-xs px-2 py-1.5 border border-slate-200 rounded-md bg-slate-50 hover:bg-slate-100 shrink-0"
          >
            {fee.isMonthly ? '/mois' : '/cont.'}
          </button>
          <button
            onClick={() => onRemove(idx)}
            className="text-slate-400 hover:text-red-500 p-1 shrink-0"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
