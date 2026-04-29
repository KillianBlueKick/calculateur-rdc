export const CONTAINERS = {
  '20': {
    label: "20' Standard",
    sublabel: '5.90 × 2.35 × 2.39 m',
    length: 5.898,
    width: 2.352,
    height: 2.393,
  },
  '40': {
    label: "40' Standard",
    sublabel: '12.03 × 2.35 × 2.39 m',
    length: 12.032,
    width: 2.352,
    height: 2.393,
  },
  '40hc': {
    label: "40' HC",
    sublabel: '12.03 × 2.35 × 2.70 m',
    length: 12.032,
    width: 2.352,
    height: 2.698,
  },
};

// Efficacité d'empilement réaliste (espace perdu entre cartons, portes, palettes)
export const PACKING_EFFICIENCY = 0.75;

export function getContainerVolume(type) {
  const c = CONTAINERS[type];
  return parseFloat((c.length * c.width * c.height).toFixed(2));
}

export function getMaxUsableVolume(type) {
  return parseFloat((getContainerVolume(type) * PACKING_EFFICIENCY).toFixed(2));
}

export const CARTON_PRESETS = [
  { id: 'standard', label: 'Standard', l: 60.0, w: 55.0, h: 40.0 },
  { id: 'bananes',  label: 'Bananes',  l: 49.7, w: 39.4, h: 23.8 },
];

// Volume d'un carton en m³ (dimensions en cm)
export function cartonVolume(l, w, h) {
  return (l / 100) * (w / 100) * (h / 100);
}
