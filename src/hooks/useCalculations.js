import { getContainerVolume, getMaxUsableVolume, cartonVolume } from '../data/containers';

export function useCalculations(state) {
  const { fees, custom, containerType, cartonFormats } = state;

  // --- Container & carton volumes ---
  const containerVol = getContainerVolume(containerType);
  const maxUsableVol = getMaxUsableVolume(containerType);
  const usedVol      = cartonFormats.reduce((s, f) => s + f.qty * cartonVolume(f.l, f.w, f.h), 0);
  const capacity     = cartonFormats.reduce((s, f) => s + f.qty, 0);
  const revenue      = cartonFormats.reduce((s, f) => s + f.qty * (f.price ?? 0), 0);

  const weightedPrice = capacity > 0 ? revenue / capacity : 0;
  const fillPct       = maxUsableVol > 0 ? Math.min((usedVol / maxUsableVol) * 100, 100) : 0;

  // --- Fee totals ---
  const sumCat = (cat) =>
    fees[cat].filter((f) => f.enabled).reduce((s, f) => s + (Number(f.amount) || 0), 0);

  const totalBE    = sumCat('belgique');
  const totalMar   = sumCat('maritime');
  const totalRDC   = sumCat('rdc');
  const totalFixes = sumCat('fixes');

  const customPerContainer = custom
    .filter((f) => f.enabled && !f.isMonthly)
    .reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const customMonthly = custom
    .filter((f) => f.enabled && f.isMonthly)
    .reduce((s, f) => s + (Number(f.amount) || 0), 0);

  const variableCost          = totalBE + totalMar + totalRDC + customPerContainer;
  const fixedCostPerContainer = totalFixes + customMonthly;
  const totalCost             = variableCost + fixedCostPerContainer;

  const cartonsSold      = capacity;
  const profit           = revenue - totalCost;
  const costPerCarton    = capacity > 0 ? variableCost / capacity : 0;
  const marginPerCarton  = weightedPrice - costPerCarton;
  const breakEvenCartons = weightedPrice > 0 ? Math.ceil(totalCost / weightedPrice) : 0;
  const breakEvenPct     = capacity > 0 ? (breakEvenCartons / capacity) * 100 : 0;
  const cartonsMissing   = profit < 0 && weightedPrice > 0 ? Math.ceil((totalCost - revenue) / weightedPrice) : 0;
  const marginPct        = revenue > 0 ? (profit / revenue) * 100 : 0;
  const progressPct      = breakEvenCartons > 0 ? Math.min(100, (cartonsSold / breakEvenCartons) * 100) : 100;

  return {
    containerVol, maxUsableVol, usedVol, capacity, weightedPrice, fillPct,
    totalBE, totalMar, totalRDC, totalFixes,
    variableCost, fixedCostPerContainer, totalCost,
    cartonsSold, revenue, profit,
    costPerCarton, marginPerCarton,
    breakEvenCartons, breakEvenPct, cartonsMissing, marginPct, progressPct,
  };
}
