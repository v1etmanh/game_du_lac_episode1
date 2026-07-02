import { createPlayer } from "../entities/createPlayer.js";
import { createChicken } from "../entities/createChicken.js";
import { createCoop } from "../entities/createCoop.js";
import { createObstacle } from "../entities/createObstacle.js";

export function createWorld(settings) {
  const chickens = [
    createChicken(0, "hen", settings),
    createChicken(1, "hen", settings),
    createChicken(2, "hen", settings),
    createChicken(3, "hen", settings),
    createChicken(4, "hen", settings),
    createChicken(5, "rooster", settings)
  ];

  return {
    player: createPlayer(settings),
    chickens,
    grainPiles: [],
    obstacles: [
      createObstacle("rock-01", 250, 180, 20),
      createObstacle("rock-02", 705, 150, 18),
      createObstacle("rock-03", 665, 505, 22),
      createObstacle("hay-01", 480, 325, 34, "hay"),
      createObstacle("hay-02", 235, 480, 30, "hay")
    ],
    decorations: [
      { id: "fence-top-01", kind: "fence", x: 95, y: 36, width: 150, height: 60 },
      { id: "fence-top-02", kind: "fence", x: 245, y: 36, width: 150, height: 60 },
      { id: "fence-left-01", kind: "fence", x: 28, y: 150, width: 150, height: 60, rotation: Math.PI / 2 },
      { id: "banana-01", kind: "bananaTree", x: 76, y: 92, width: 126, height: 150 },
      { id: "banana-02", kind: "bananaTree", x: 902, y: 520, width: 116, height: 138 }
    ],
    coop: createCoop(settings),
    clapWaves: [],
    stats: {
      startedAt: 0,
      elapsedTime: 0,
      grainDropsUsed: 0,
      coopToggles: 0,
      clapsUsed: 0,
      panicCount: 0,
      obstacleCollisions: 0,
      stuckRecoveries: 0,
      coopBailed: 0,
      playerDistance: 0,
      averageChickenDistance: 0
    },
    completed: false,
    paused: false,
    grainCharges: settings.grainDropCount,
    grainRechargeTimer: 0,
    grainSequence: 0,
    clapSequence: 0
  };
}

export function snapshotWorld(world, settings) {
  const securedCount = world.chickens.filter((chicken) => chicken.secured).length;
  const totalChickenDistance = world.chickens.reduce((sum, chicken) => sum + chicken.distanceTravelled, 0);

  return {
    elapsedTime: world.stats.elapsedTime,
    grainDropsUsed: world.stats.grainDropsUsed,
    grainDropsRemaining: world.grainCharges,
    grainRechargeRemaining:
      world.grainCharges >= settings.grainDropCount ? 0 : Math.max(0, settings.grainRechargeInterval - world.grainRechargeTimer),
    grainRemaining: world.grainPiles.reduce((sum, pile) => sum + pile.amount, 0),
    securedCount,
    chickenCount: world.chickens.length,
    completed: world.completed,
    paused: world.paused,
    coopClosed: world.coop.closed,
    activeClapWaves: world.clapWaves.length,
    playerSprint: {
      active: world.player.sprintActiveTime > 0,
      activeTime: world.player.sprintActiveTime,
      cooldownRemaining: world.player.sprintActiveTime > 0 ? 0 : world.player.sprintCooldownRemaining
    },
    stats: {
      ...world.stats,
      averageChickenDistance: world.chickens.length > 0 ? totalChickenDistance / world.chickens.length : 0
    },
    chickens: world.chickens.map((chicken) => ({
      id: chicken.id,
      type: chicken.type,
      state: chicken.state,
      secured: chicken.secured,
      coopStayTime: chicken.coopStayTime
    }))
  };
}
