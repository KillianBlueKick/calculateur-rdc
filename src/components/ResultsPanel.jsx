import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import BreakevenChart from './BreakevenChart';
import ContainerWidget from './ContainerWidget';

const fmt = (n) => '€' + Math.round(n).toLocaleString('fr-BE');

function marginBadge(pct) {
  if (pct < 0) return { label: 'Perte', cls: 'bg-red-100 text-red-700' };
  if (pct < 20) return { label: `${Math.round(pct)}%`, cls: 'bg-amber-100 text-amber-700' };
  if (pct < 40) return { label: `${Math.round(pct)}%`, cls: 'bg-yellow-100 text-yellow-700' };
  return { label: `${Math.round(pct)}%`, cls: 'bg-emerald-100 text-emerald-700' };
}

export default function ResultsPanel({ calcs, globals }) {
  const [copied, setCopied] = useState(false);

  const {
    revenue, totalCost, variableCost, fixedCostPerContainer,
    profit, marginPct, cartonsSold, breakEvenCartons, breakEvenReachable, breakEvenPct,
    cartonsMissing, progressPct, marginPerCarton, costPerCarton,
    fillPct, capacity, weightedPrice,
  } = calcs;

  const badge = marginBadge(marginPct);

  const handleCopy = () => {
    const date = new Date().toLocaleDateString('fr-BE');
    const text = [
      '=== Résumé conteneur RDC ===',
      `Date : ${date}`,
      `Cartons vendus : ${cartonsSold}/${capacity} (${Math.round(fillPct)}%)`,
      `Revenu : ${fmt(revenue)}`,
      `Coûts variables : ${fmt(variableCost)}`,
      `Coûts fixes (par conteneur) : ${fmt(fixedCostPerContainer)}`,
      `Coûts totaux : ${fmt(totalCost)}`,
      `Bénéfice net : ${fmt(profit)} (marge ${Math.round(marginPct)}%)`,
      `Seuil de rentabilité : ${breakEvenCartons} cartons (${Math.round(breakEvenPct)}% du conteneur)`,
      `Marge par carton : ${fmt(marginPerCarton)}`,
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-3">
      {/* Revenu */}
      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-xs text-slate-500 mb-1">Revenu</p>
        <p className="text-2xl font-semibold text-emerald-600">{fmt(revenue)}</p>
        <p className="text-xs text-slate-400 mt-1">
          {cartonsSold} cartons · prix moyen €{Math.round(weightedPrice * 100) / 100}
        </p>
      </div>

      {/* Coûts */}
      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-xs text-slate-500 mb-1">Coûts totaux par conteneur</p>
        <p className="text-2xl font-semibold text-red-600">{fmt(totalCost)}</p>
        <p className="text-xs text-slate-400 mt-1">
          Variables : {fmt(variableCost)} | Fixes : {fmt(fixedCostPerContainer)}
        </p>
      </div>

      {/* Bénéfice */}
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-xs text-slate-500">Bénéfice net</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <p className={`text-2xl font-semibold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {fmt(profit)}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {profit >= 0
            ? `Marge : ${Math.round(marginPct)}%`
            : `Il manque ${cartonsMissing} cartons pour être rentable`}
        </p>
      </div>

      {/* Seuil */}
      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-xs text-slate-500 mb-1">Seuil de rentabilité</p>
        {breakEvenReachable ? (
          <>
            <p className="text-lg font-semibold">{breakEvenCartons} cartons</p>
            <p className="text-xs text-slate-400 mt-1">
              {Math.round(breakEvenPct)}% du conteneur à remplir
            </p>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full transition-all duration-500 ${
                  cartonsSold >= breakEvenCartons ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-red-600">Impossible</p>
            <p className="text-xs text-red-400 mt-1">
              Le conteneur plein ne couvre pas les coûts ({cartonsMissing > 0 ? `il manque ${cartonsMissing} cartons` : 'augmentez les prix ou réduisez les frais'})
            </p>
            <div className="h-2 bg-red-200 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </>
        )}
      </div>

      {/* Marge par carton */}
      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-xs text-slate-500 mb-1">Marge par carton</p>
        <p className="text-lg font-semibold">{fmt(marginPerCarton)}</p>
        <p className="text-xs text-slate-400 mt-1">
          Coût variable par carton : {fmt(costPerCarton)}
        </p>
      </div>

      {/* Widget conteneur */}
      <ContainerWidget
        cartonsSold={cartonsSold}
        capacity={calcs.capacity}
        usedVol={calcs.usedVol}
        containerVol={calcs.containerVol}
      />

      {/* Graphique */}
      <BreakevenChart
        capacity={capacity}
        price={globals.price}
        totalCost={totalCost}
        cartonsSold={cartonsSold}
        breakEvenCartons={breakEvenCartons}
      />

      {/* Export */}
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors"
      >
        {copied ? (
          <><Check size={14} className="text-emerald-500" /> Copié dans le presse-papier</>
        ) : (
          <><Copy size={14} /> Copier le résumé</>
        )}
      </button>
    </div>
  );
}
