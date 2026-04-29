import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const fmt = (n) => '€' + Math.round(n).toLocaleString('fr-BE');

function FeeRow({ fee, cat, idx, onUpdate }) {
  return (
    <div
      className={`grid grid-cols-[auto_1fr_auto] gap-3 items-center py-2 border-b border-slate-100 last:border-0 ${
        !fee.enabled ? 'opacity-40' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={fee.enabled}
        onChange={(e) => onUpdate(cat, idx, 'enabled', e.target.checked)}
        className="w-5 h-5 cursor-pointer accent-slate-700"
      />
      <span className="text-sm">{fee.label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={fee.amount}
          onChange={(e) => onUpdate(cat, idx, 'amount', Number(e.target.value) || 0)}
          className="w-20 px-2 py-1.5 text-sm text-right border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
        <span className="text-xs text-slate-400">€</span>
      </div>
    </div>
  );
}

export default function FeeSection({ title, total, fees, cat, onUpdate, totalSuffix = '', defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white border border-slate-200 rounded-lg mb-3 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex justify-between items-center px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={15} className="text-slate-400" /> : <ChevronRight size={15} className="text-slate-400" />}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <span className="text-sm text-slate-500 font-medium">
          {fmt(total)}{totalSuffix}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-3 border-t border-slate-100">
          {fees.map((fee, idx) => (
            <FeeRow key={fee.id} fee={fee} cat={cat} idx={idx} onUpdate={onUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
