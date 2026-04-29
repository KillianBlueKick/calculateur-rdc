import { useState } from 'react';
import { RotateCcw, SlidersHorizontal, BarChart2 } from 'lucide-react';
import { useCalculatorState } from '../hooks/useCalculatorState';
import { useCalculations } from '../hooks/useCalculations';
import GlobalParams from './GlobalParams';
import FeeSection from './FeeSection';
import CustomFees from './CustomFees';
import ResultsPanel from './ResultsPanel';
import ScenarioManager from './ScenarioManager';

export default function Calculator() {
  const {
    state, scenarios,
    updateFee, updateCustom, addCustom, removeCustom, updateGlobal, reset,
    saveScenario, loadScenario, deleteScenario,
  } = useCalculatorState();

  const calcs = useCalculations(state);
  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'results'

  const setQuickFill = (type) => {
    let newSold;
    if (type === 'be') {
      newSold = calcs.breakEvenCartons;
    } else {
      newSold = Math.round((state.globals.capacity * type) / 100);
    }
    updateGlobal('sold', newSold);
  };

  const isMobileResults = activeTab === 'results';

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6 pb-20 lg:pb-6">
      <h1 className="text-xl lg:text-2xl font-semibold mb-4 lg:mb-6 text-slate-900">
        Calculateur de rentabilité — Conteneur RDC
      </h1>

      {/* Mobile summary bar */}
      <div className="lg:hidden flex gap-3 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex-1">
          <p className="text-xs text-slate-500">Revenu</p>
          <p className="text-base font-semibold text-emerald-600">
            {'€' + Math.round(calcs.revenue).toLocaleString('fr-BE')}
          </p>
        </div>
        <div className="w-px bg-slate-200" />
        <div className="flex-1">
          <p className="text-xs text-slate-500">Bénéfice</p>
          <p className={`text-base font-semibold ${calcs.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {'€' + Math.round(calcs.profit).toLocaleString('fr-BE')}
          </p>
        </div>
        <div className="w-px bg-slate-200" />
        <div className="flex-1">
          <p className="text-xs text-slate-500">Seuil</p>
          <p className="text-base font-semibold text-slate-700">
            {calcs.breakEvenCartons} crt.
          </p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column — config (hidden on mobile when results tab active) */}
        <div className={isMobileResults ? 'hidden lg:block' : ''}>
          <GlobalParams
            globals={state.globals}
            fillPct={calcs.fillPct}
            cartonsSold={calcs.cartonsSold}
            breakEvenCartons={calcs.breakEvenCartons}
            onUpdate={updateGlobal}
            onQuickFill={setQuickFill}
          />

          <FeeSection
            title="Frais Belgique"
            total={calcs.totalBE}
            fees={state.fees.belgique}
            cat="belgique"
            onUpdate={updateFee}
            defaultOpen={true}
          />
          <FeeSection
            title="Fret maritime (Remant)"
            total={calcs.totalMar}
            fees={state.fees.maritime}
            cat="maritime"
            onUpdate={updateFee}
            defaultOpen={false}
          />
          <FeeSection
            title="Frais RDC"
            total={calcs.totalRDC}
            fees={state.fees.rdc}
            cat="rdc"
            onUpdate={updateFee}
            defaultOpen={false}
          />
          <FeeSection
            title="Frais fixes mensuels"
            total={calcs.totalFixes}
            fees={state.fees.fixes}
            cat="fixes"
            onUpdate={updateFee}
            totalSuffix="/mois"
            defaultOpen={false}
          />

          <CustomFees
            custom={state.custom}
            onUpdate={updateCustom}
            onAdd={addCustom}
            onRemove={removeCustom}
          />

          <ScenarioManager
            scenarios={scenarios}
            profit={calcs.profit}
            onSave={saveScenario}
            onLoad={loadScenario}
            onDelete={deleteScenario}
          />

          <button
            onClick={reset}
            className="w-full py-2.5 text-sm flex items-center justify-center gap-2 border border-slate-200 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors text-slate-600"
          >
            <RotateCcw size={14} /> Réinitialiser tous les paramètres
          </button>
        </div>

        {/* Right column — results (hidden on mobile when config tab active) */}
        <div className={`lg:sticky lg:top-4 lg:self-start ${!isMobileResults ? 'hidden lg:block' : ''}`}>
          <ResultsPanel calcs={calcs} globals={state.globals} />
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-slate-200 px-4 py-2 flex gap-2">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'config'
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <SlidersHorizontal size={16} /> Configuration
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'results'
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <BarChart2 size={16} /> Résultats
        </button>
      </div>
    </div>
  );
}
