import { useMemo } from 'react';
import { getContainerVolume, getMaxUsableVolume, cartonVolume } from '../data/containers';

export function useCalculations(state) {
  return useMemo(() => {
    const { fees, custom, globals, containerType, cartonFormats } = state;

    // --- Container & carton volumes ---
    const containerVol = getContainerVolume(containerType);
    const maxUsableVol = getMaxUsableVolume(containerType);
    const usedVol = cartonFormats.reduce((s, f) => s + f.qty * cartonVolume(f.l, f.w, f.h), 0);
    const capacity = cartonFormats.reduce((s, f) => s + f.qty, 0);

    // --- Fee totals ---
    const sumCat = (cat) =>
      fees[cat].filter((f) => f.enabled).reduce((s, f) => s + (Number(f.amount) || 0), 0);

    const totalBE = sumCat('belgique');
    const totalMar = sumCat('maritime');
    const totalRDC = sumCat('rdc');
    const totalFixes = sumCat('fixes');

    const customPerContainer = custom
      .filter((f) => f.enabled && !f.isMonthly)
      .reduce((s, f) => s + (Number(f.amount) || 0), 0);
    const customMonthly = custom
      .filter((f) => f.enabled && f.isMonthly)
      .reduce((s, f) => s + (Number(f.amount) || 0), 0);

    const variableCost = totalBE + totalMar + totalRDC + customPerContainer;
    const fixedCostPerContainer = (totalFixes + customMonthly) / Math.max(globals.containers, 0.1);
    const totalCost = variableCost + fixedCostPerContainer;

    // --- Sales simulation ---
    const cartonsSold = Math.min(globals.sold, capacity);
    const fillPct = capacity > 0 ? (cartonsSold / capacity) * 100 : 0;
    const revenue = cartonsSold * globals.price;
    const profit = revenue - totalCost;

    const costPerCarton = capacity > 0 ? variableCost / capacity : 0;
    const marginPerCarton = globals.price - costPerCarton;
    const breakEvenCartons = globals.price > 0 ? Math.ceil(totalCost / globals.price) : 0;
    const breakEvenPct = capacity > 0 ? (breakEvenCartons / capacity) * 100 : 0;
    const cartonsMissing = profit < 0 ? Math.ceil((totalCost - revenue) / globals.price) : 0;
    const marginPct = revenue > 0 ? (profit / revenue) * 100 : 0;
    const progressPct = breakEvenCartons > 0 ? Math.min(100, (cartonsSold / breakEvenCartons) * 100) : 100;

    return {
      // container
      containerVol, maxUsableVol, usedVol, capacity,
      // fees
      totalBE, totalMar, totalRDC, totalFixes,
      variableCost, fixedCostPerContainer, totalCost,
      // simulation
      cartonsSold, fillPct, revenue, profit,
      costPerCarton, marginPerCarton,
      breakEvenCartons, breakEvenPct, cartonsMissing, marginPct, progressPct,
    };
  }, [state]);
}
