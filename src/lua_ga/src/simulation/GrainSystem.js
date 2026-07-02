import { createGrainPile } from "../entities/createGrainPile.js";
import { distance } from "../math/vector.js";

function getCoopGatePoint(coop) {
  return {
    x: coop.x,
    y: coop.y + coop.height / 2
  };
}

function isTooCloseToCoopGate(pile, world, settings) {
  return distance(pile, getCoopGatePoint(world.coop)) < settings.grainCoopGateExclusionRadius;
}

export function dropGrain(world, settings, x = world.player.x, y = world.player.y) {
  if (world.grainCharges <= 0 || world.completed) {
    return false;
  }

  world.grainSequence += 1;
  const pile = createGrainPile(`grain-${world.grainSequence}`, x, y, settings);
  pile.tooCloseToCoopGate = isTooCloseToCoopGate(pile, world, settings);
  world.grainPiles.push(pile);
  world.grainCharges -= 1;
  world.stats.grainDropsUsed += 1;

  return true;
}

export function updateGrain(world, settings, deltaTime) {
  world.grainCharges = Math.min(world.grainCharges, settings.grainDropCount);

  if (world.grainCharges < settings.grainDropCount) {
    world.grainRechargeTimer += deltaTime;

    while (world.grainRechargeTimer >= settings.grainRechargeInterval && world.grainCharges < settings.grainDropCount) {
      world.grainCharges += 1;
      world.grainRechargeTimer -= settings.grainRechargeInterval;
    }
  } else {
    world.grainRechargeTimer = 0;
  }

  for (const pile of world.grainPiles) {
    pile.age += deltaTime;
    pile.attractionRadius = settings.grainAttractionRadius;
    pile.playerExclusionRadius = settings.grainPlayerExclusionRadius;
    pile.coopGateExclusionRadius = settings.grainCoopGateExclusionRadius;
    pile.tooCloseToCoopGate = isTooCloseToCoopGate(pile, world, settings);

    if (pile.age >= settings.grainLifetime || pile.amount <= 0) {
      pile.active = false;
    }
  }

  world.grainPiles = world.grainPiles.filter((pile) => pile.active);
}

export function consumeGrain(pile, settings, deltaTime) {
  pile.consumeAccumulator += deltaTime;

  while (pile.consumeAccumulator >= settings.grainConsumeInterval && pile.amount > 0) {
    pile.amount -= 1;
    pile.consumeAccumulator -= settings.grainConsumeInterval;
  }

  if (pile.amount <= 0) {
    pile.active = false;
  }
}
