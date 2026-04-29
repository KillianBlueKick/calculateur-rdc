import { useState } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { CARTON_PRESETS, cartonVolume } from '../data/containers';

function QtyStep({ value, onChange, canIncrease }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-md hover:bg-slate-100 text-slate-600 font-bold"
      >−</button>
      <input
        type="number"
        value={value}
        min={0}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className="w-16 text-center text-sm border border-slate-200 rounded-md py-1 focus:outline-none focus:ring-1 focus:ring-slate-400"
      />
      <button
        onClick={() => canIncrease && onChange(value + 1)}
        disabled={!canIncrease}
        className={`w-7 h-7 flex items-center justify-center border rounded-md font-bold transition-colors ${
          canIncrease
            ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
            : 'border-slate-100 text-slate-300 cursor-not-allowed'
        }`}
      >+</button>
    </div>
  );
}

export default function CartonConfig({ formats, usedVol, maxUsableVol, onAdd, onUpdate, onRemove }) {
  const [selectedPreset, setSelectedPreset] = useState('standard');

  const volPct = maxUsableVol > 0 ? Math.min((usedVol / maxUsableVol) * 100, 100) : 0;
  const isOverflow = usedVol > maxUsableVol + 0.001;
  const remaining = Math.max(0, maxUsableVol - usedVol);

  const handleAddPreset = () => {
    const preset = CARTON_PRESETS.find((p) => p.id === selectedPreset);
    if (!preset) return;
    const vol = cartonVolume(preset.l, preset.w, preset.h);
    const maxQty = vol > 0 ? Math.floor(remaining / vol) : 0;
    onAdd({
      id: Date.now(),
      label: preset.label,
      l: preset.l, w: preset.w, h: preset.h,
      qty: Math.min(1, maxQty),
      price: 100,
      isPreset: true,
      presetId: preset.id,
    });
  };

  const handleAddCustom = () => {
    onAdd({
      id: Date.now(),
      label: 'Personnalisé',
      l: 40, w: 30, h: 30,
      qty: 0,
      price: 100,
      isPreset: false,
      presetId: null,
    });
  };

  const canIncreaseQty = (format) => {
    const vol = cartonVolume(format.l, format.w, format.h);
    return usedVol + vol <= maxUsableVol + 0.0001;
  };

  const handleQtyChange = (idx, newQty) => {
    const format = formats[idx];
    const vol = cartonVolume(format.l, format.w, format.h);
    const otherVol = usedVol - format.qty * vol;
    const maxQty = vol > 0 ? Math.floor((maxUsableVol - otherVol) / vol) : 0;
    onUpdate(idx, 'qty', Math.min(newQty, Math.max(0, maxQty)));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 mb-3">
      <h3 className="text-sm font-medium mb-3">Types de cartons</h3>

      {/* Add row */}
      <div className="flex gap-2 mb-3">
        <select
          value={selectedPreset}
          onChange={(e) => setSelectedPreset(e.target.value)}
          className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
        >
          {CARTON_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>{p.label} — {p.l}×{p.w}×{p.h} cm</option>
          ))}
        </select>
        <button
          onClick={handleAddPreset}
          className="flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shrink-0"
        >
          <Plus size={12} /> Ajouter
        </button>
        <button
          onClick={handleAddCustom}
          title="Ajouter un format personnalisé"
          className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shrink-0"
        >
          <Plus size={14} className="text-slate-600" />
        </button>
      </div>

      {formats.length === 0 && (
        <p className="text-xs text-slate-400 italic py-2">Aucun format — ajoutez-en un ci-dessus.</p>
      )}

      <div className="space-y-2">
        {formats.map((f, idx) => {
          const vol = cartonVolume(f.l, f.w, f.h);
          const canIncrease = canIncreaseQty(f);

          return (
            <div key={f.id} className="border border-slate-100 rounded-lg p-2.5 bg-slate-50">
              {/* Label + delete */}
              <div className="flex items-center justify-between mb-2">
                {f.isPreset ? (
                  <span className="text-sm font-medium text-slate-700">{f.label}</span>
                ) : (
                  <input
                    type="text"
                    value={f.label}
                    onChange={(e) => onUpdate(idx, 'label', e.target.value)}
                    className="text-sm font-medium border-b border-slate-300 bg-transparent focus:outline-none focus:border-slate-600 w-32"
                  />
                )}
                <button onClick={() => onRemove(idx)} className="text-slate-400 hover:text-red-500 p-0.5">
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Dimensions */}
              {f.isPreset ? (
                <p className="text-xs text-slate-400 mb-2">
                  {f.l} × {f.w} × {f.h} cm &nbsp;·&nbsp; {(vol * 1000).toFixed(1)} L / carton
                </p>
              ) : (
                <div className="flex items-center gap-1 mb-2 flex-wrap">
                  {['l', 'w', 'h'].map((dim, di) => (
                    <div key={dim} className="flex items-center gap-0.5">
                      {di > 0 && <span className="text-slate-300 text-xs">×</span>}
                      <input
                        type="number"
                        value={f[dim]}
                        min={1}
                        step={0.1}
                        onChange={(e) => onUpdate(idx, dim, parseFloat(e.target.value) || 1)}
                        className="w-14 px-1.5 py-1 text-xs text-center border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                    </div>
                  ))}
                  <span className="text-xs text-slate-400">cm &nbsp;·&nbsp; {(vol * 1000).toFixed(1)} L</span>
                </div>
              )}

              {/* Prix + Quantité sur la même ligne */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">Prix</span>
                  <div className="flex items-center gap-0.5">
                    <input
                      type="number"
                      value={f.price ?? 100}
                      min={0}
                      step={1}
                      onChange={(e) => onUpdate(idx, 'price', Number(e.target.value) || 0)}
                      className="w-16 px-1.5 py-1 text-xs text-right border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                    <span className="text-xs text-slate-400">€</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">Qté</span>
                  <QtyStep
                    value={f.qty}
                    onChange={(v) => handleQtyChange(idx, v)}
                    canIncrease={canIncrease}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-1 text-right">
                {(f.qty * vol).toFixed(2)} m³
              </p>
            </div>
          );
        })}
      </div>

      {/* Volume summary */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-1.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverflow ? 'bg-red-500' : volPct > 85 ? 'bg-amber-400' : 'bg-emerald-500'
            }`}
            style={{ width: `${volPct}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className={isOverflow ? 'text-red-600 font-medium' : 'text-slate-500'}>
            {isOverflow && <AlertTriangle size={11} className="inline mr-1" />}
            {usedVol.toFixed(2)} m³ / {maxUsableVol.toFixed(2)} m³ max
          </span>
          <span className="font-semibold text-slate-700">
            {formats.reduce((s, f) => s + f.qty, 0)} cartons
          </span>
        </div>
        {isOverflow && <p className="text-xs text-red-600 mt-1">Volume dépassé — réduisez les quantités.</p>}
      </div>
    </div>
  );
}
