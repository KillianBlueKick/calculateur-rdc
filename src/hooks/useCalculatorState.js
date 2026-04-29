import { useState, useEffect } from 'react';
import { getMaxUsableVolume, cartonVolume } from '../data/containers';

const STORAGE_KEY = 'rdc-calc-v2';
const SCENARIOS_KEY = 'rdc-calc-v2-scenarios';

export const defaultFees = {
  belgique: [
    { id: 'be1', label: 'Transport dépôt → Anvers', amount: 400, enabled: true },
    { id: 'be2', label: 'Empotage du conteneur', amount: 300, enabled: true },
    { id: 'be3', label: "Matériel d'emballage", amount: 150, enabled: true },
    { id: 'be4', label: 'Déclaration douane export', amount: 200, enabled: true },
    { id: 'be5', label: 'Documentation (BL, certifs)', amount: 100, enabled: true },
  ],
  maritime: [
    { id: 'm1', label: 'Fret maritime Anvers → Matadi', amount: 5400, enabled: true },
    { id: 'm2', label: 'BAF (surcharge carburant)', amount: 300, enabled: true },
    { id: 'm3', label: 'THC Anvers', amount: 275, enabled: true },
    { id: 'm4', label: 'Surcharges (sécurité, etc.)', amount: 225, enabled: true },
    { id: 'm5', label: 'Assurance maritime', amount: 225, enabled: true },
  ],
  rdc: [
    { id: 'r1', label: 'THC Matadi', amount: 400, enabled: true },
    { id: 'r2', label: 'Dédouanement RDC', amount: 750, enabled: true },
    { id: 'r3', label: 'Inspection et scanning', amount: 175, enabled: true },
    { id: 'r4', label: 'Transport Matadi → Kinshasa', amount: 750, enabled: true },
    { id: 'r5', label: 'Dépotage + stockage', amount: 300, enabled: true },
    { id: 'r6', label: 'Distribution locale', amount: 450, enabled: true },
    { id: 'r7', label: 'Frais informels', amount: 350, enabled: true },
  ],
  fixes: [
    { id: 'f1', label: 'Local/dépôt Bruxelles', amount: 1000, enabled: true },
    { id: 'f2', label: 'Camionnette (leasing)', amount: 450, enabled: true },
    { id: 'f3', label: 'Stack digital', amount: 150, enabled: true },
    { id: 'f4', label: 'WhatsApp + Twilio', amount: 75, enabled: true },
    { id: 'f5', label: 'Assurance RC pro', amount: 150, enabled: true },
    { id: 'f6', label: 'Téléphone, internet', amount: 200, enabled: true },
    { id: 'f7', label: 'Marketing', amount: 300, enabled: true },
    { id: 'f8', label: 'Comptable', amount: 200, enabled: true },
    { id: 'f9', label: "Main-d'œuvre ponctuelle", amount: 750, enabled: true },
    { id: 'f10', label: 'Cotisations sociales', amount: 750, enabled: true },
  ],
};

export const defaultGlobals = { price: 100, containers: 1, sold: 430 };

export const defaultCartonFormats = [
  { id: 'init-std', label: 'Standard', l: 60, w: 55, h: 40, qty: 430, isPreset: true, presetId: 'standard' },
];

export const defaultContainerType = '40hc';

function migrate(saved) {
  // Add containerType if missing (old saves)
  if (!saved.containerType) saved.containerType = defaultContainerType;

  // Add cartonFormats if missing — migrate from old globals.capacity
  if (!saved.cartonFormats) {
    const oldCapacity = saved.globals?.capacity ?? 430;
    saved.cartonFormats = [
      { id: 'init-std', label: 'Standard', l: 60, w: 55, h: 40, qty: oldCapacity, isPreset: true, presetId: 'standard' },
    ];
  }

  // Remove legacy capacity from globals
  if (saved.globals) delete saved.globals.capacity;

  return saved;
}

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return migrate(JSON.parse(saved));
  } catch (e) {}
  return {
    containerType: defaultContainerType,
    cartonFormats: JSON.parse(JSON.stringify(defaultCartonFormats)),
    fees: JSON.parse(JSON.stringify(defaultFees)),
    custom: [],
    globals: { ...defaultGlobals },
  };
}

function loadScenarios() {
  try {
    const saved = localStorage.getItem(SCENARIOS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
}

function capSold(state) {
  const capacity = state.cartonFormats.reduce((s, f) => s + f.qty, 0);
  if (state.globals.sold > capacity) {
    return { ...state, globals: { ...state.globals, sold: capacity } };
  }
  return state;
}

export function useCalculatorState() {
  const [state, setState] = useState(loadInitialState);
  const [scenarios, setScenarios] = useState(loadScenarios);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }, [state]);

  useEffect(() => {
    try { localStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios)); } catch (e) {}
  }, [scenarios]);

  const updateFee = (cat, idx, field, value) => {
    setState((prev) => {
      const newFees = { ...prev.fees, [cat]: [...prev.fees[cat]] };
      newFees[cat][idx] = { ...newFees[cat][idx], [field]: value };
      return { ...prev, fees: newFees };
    });
  };

  const updateCustom = (idx, field, value) => {
    setState((prev) => {
      const newCustom = [...prev.custom];
      newCustom[idx] = { ...newCustom[idx], [field]: value };
      return { ...prev, custom: newCustom };
    });
  };

  const addCustom = () => {
    setState((prev) => ({
      ...prev,
      custom: [...prev.custom, { label: 'Nouveau frais', amount: 0, enabled: true, isMonthly: false }],
    }));
  };

  const removeCustom = (idx) => {
    setState((prev) => ({ ...prev, custom: prev.custom.filter((_, i) => i !== idx) }));
  };

  const updateGlobal = (key, value) => {
    setState((prev) => {
      const capacity = prev.cartonFormats.reduce((s, f) => s + f.qty, 0);
      const newGlobals = { ...prev.globals, [key]: Number(value) || 0 };
      if (key === 'sold' && newGlobals.sold > capacity) newGlobals.sold = capacity;
      return { ...prev, globals: newGlobals };
    });
  };

  const setContainerType = (type) => {
    setState((prev) => {
      const maxVol = getMaxUsableVolume(type);
      // Cap each format's qty so total volume stays within new container
      let remaining = maxVol;
      const newFormats = prev.cartonFormats.map((f) => {
        const vol = cartonVolume(f.l, f.w, f.h);
        const maxQty = vol > 0 ? Math.floor(remaining / vol) : 0;
        const qty = Math.min(f.qty, maxQty);
        remaining -= qty * vol;
        return { ...f, qty };
      });
      return capSold({ ...prev, containerType: type, cartonFormats: newFormats });
    });
  };

  const addCartonFormat = (format) => {
    setState((prev) => capSold({ ...prev, cartonFormats: [...prev.cartonFormats, format] }));
  };

  const updateCartonFormat = (idx, field, value) => {
    setState((prev) => {
      const newFormats = [...prev.cartonFormats];
      newFormats[idx] = { ...newFormats[idx], [field]: value };
      return capSold({ ...prev, cartonFormats: newFormats });
    });
  };

  const removeCartonFormat = (idx) => {
    setState((prev) =>
      capSold({ ...prev, cartonFormats: prev.cartonFormats.filter((_, i) => i !== idx) })
    );
  };

  const reset = () => {
    if (confirm('Réinitialiser toutes les valeurs aux paramètres par défaut ?')) {
      localStorage.removeItem(STORAGE_KEY);
      setState({
        containerType: defaultContainerType,
        cartonFormats: JSON.parse(JSON.stringify(defaultCartonFormats)),
        fees: JSON.parse(JSON.stringify(defaultFees)),
        custom: [],
        globals: { ...defaultGlobals },
      });
    }
  };

  const saveScenario = (name) => {
    if (scenarios.length >= 3) return false;
    setScenarios((prev) => [...prev, { name, state: JSON.parse(JSON.stringify(state)), savedAt: Date.now() }]);
    return true;
  };

  const loadScenario = (idx) => {
    const s = scenarios[idx];
    if (s) setState(migrate(JSON.parse(JSON.stringify(s.state))));
  };

  const deleteScenario = (idx) => {
    setScenarios((prev) => prev.filter((_, i) => i !== idx));
  };

  return {
    state, scenarios,
    updateFee, updateCustom, addCustom, removeCustom, updateGlobal,
    setContainerType, addCartonFormat, updateCartonFormat, removeCartonFormat,
    reset, saveScenario, loadScenario, deleteScenario,
  };
}
