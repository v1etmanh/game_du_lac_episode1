export function createGrainPile(id, x, y, settings) {
  return {
    id,
    x,
    y,
    radius: 6,
    amount: settings.grainAmountPerDrop,
    attractionRadius: settings.grainAttractionRadius,
    playerExclusionRadius: settings.grainPlayerExclusionRadius,
    coopGateExclusionRadius: settings.grainCoopGateExclusionRadius,
    tooCloseToCoopGate: false,
    consumeAccumulator: 0,
    age: 0,
    active: true
  };
}
