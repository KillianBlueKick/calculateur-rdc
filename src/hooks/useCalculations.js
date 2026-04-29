import { useMemo } from 'react';

export function useCalculations(state) {
  return useMemo(() => {
    const { fees, custom, globals } = state;

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

    const cartonsSold = Math.min(globals.sold, globals.capacity);
    const fillPct = globals.capacity > 0 ? (cartonsSold / globals.capacity) * 100 : 0;
    const revenue = cartonsSold * globals.price;
    const profit = revenue - totalCost;

    const costPerCarton = globals.capacity > 0 ? variableCost / globals.capacity : 0;
    const marginPerCarton = globals.price - costPerCarton;
    const breakEvenCartons = globals.price > 0 ? Math.ceil(totalCost / globals.price) : 0;
    const breakEvenPct = globals.capacity > 0 ? (breakEvenCartons / globals.capacity) * 100 : 0;
    const cartonsMissing = profit < 0 ? Math.ceil((totalCost - revenue) / globals.price) : 0;
    const marginPct = revenue > 0 ? (profit / revenue) * 100 : 0;
    const progressPct = breakEvenCartons > 0 ? Math.min(100, (cartonsSold / breakEvenCartons) * 100) : 100;

    return {
      totalBE,
      totalMar,
      totalRDC,
      totalFixes,
      variableCost,
      fixedCostPerContainer,
      totalCost,
      cartonsSold,
      fillPct,
      revenue,
      profit,
      costPerCarton,
      marginPerCarton,
      breakEvenCartons,
      breakEvenPct,
      cartonsMissing,
      marginPct,
      progressPct,
    };
  }, [state]);
}
