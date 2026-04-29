import { useState, useEffect } from 'react';

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

export const defaultGlobals = { price: 100, capacity: 430, containers: 1, sold: 430 };

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
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

export function useCalculatorState() {
  const [state, setState] = useState(loadInitialState);
  const [scenarios, setScenarios] = useState(loadScenarios);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }, [state]);

  useEffect(() => {
    try {
      localStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios));
    } catch (e) {}
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
      const newGlobals = { ...prev.globals, [key]: Number(value) || 0 };
      if (key === 'capacity' && newGlobals.sold > newGlobals.capacity) {
        newGlobals.sold = newGlobals.capacity;
      }
      return { ...prev, globals: newGlobals };
    });
  };

  const reset = () => {
    if (confirm('Réinitialiser toutes les valeurs aux paramètres par défaut ?')) {
      localStorage.removeItem(STORAGE_KEY);
      setState({
        fees: JSON.parse(JSON.stringify(defaultFees)),
        custom: [],
        globals: { ...defaultGlobals },
      });
    }
  };

  const saveScenario = (name) => {
    if (scenarios.length >= 3) return false;
    const scenario = { name, state: JSON.parse(JSON.stringify(state)), savedAt: Date.now() };
    setScenarios((prev) => [...prev, scenario]);
    return true;
  };

  const loadScenario = (idx) => {
    const scenario = scenarios[idx];
    if (scenario) setState(scenario.state);
  };

  const deleteScenario = (idx) => {
    setScenarios((prev) => prev.filter((_, i) => i !== idx));
  };

  return {
    state,
    scenarios,
    updateFee,
    updateCustom,
    addCustom,
    removeCustom,
    updateGlobal,
    reset,
    saveScenario,
    loadScenario,
    deleteScenario,
  };
}
