import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react';

const WORLD = { width: 1207, height: 820 };
const TOTAL_TIME = 420;
const TARGET_FRUITS = 200;
const CHARACTER_SCALE = 1.6;
const JUMP_DISTANCE = 82;
const FALL_TIME_SCALE = 0.34;
const HANGING_COUNTDOWN_MIN = 6;
const HANGING_COUNTDOWN_MAX = 10;
// Canh bao "Mua qua" hien 5s truoc khi mua roi, cong voi thoi gian nghi
// sau moi dot mua de tong khoang cach giua 2 lan mua tu dong gan 38s.
const ROW_RAIN_COUNTDOWN = 5;
const ROW_RAIN_COOLDOWN = 33;
const BASKET_COLS = 3;
const BASKET_ROWS = 6;
const BASKET_SIZE = BASKET_COLS * BASKET_ROWS;
const POWER_SPIN_MS = 1400;
const POWER_RESULT_MS = 900;
const POWER_COOLDOWN_MS = 7000;
const MAGNET_DURATION = 5;
const TIME_STOP_DURATION = 4;
const MAGNET_RADIUS = 180;
const MAGNET_BASKET_SKIP_INTERVAL = 3;
const MAGNET_TREE_REFILL_DELAY = 16;

const POWER_TYPES = [
  { id: 'magnet', label: 'Nam cham', shortLabel: 'NC' },
  { id: 'timeStop', label: 'Dung thoi gian', shortLabel: 'TG' },
];

const PHASE_CONFIG = {
  1: { trees: 3, fruitsPerTree: 1, dropInterval: 10, fallMin: 6, fallMax: 7 },
  2: { trees: 4, fruitsPerTree: 1, dropInterval: 10, fallMin: 6, fallMax: 10 },
  3: { trees: 4, fruitsPerTree: 2, dropInterval: 10, fallMin: 5, fallMax: 9 },
  4: { trees: 5, fruitsPerTree: 2, dropInterval: 8, fallMin: 4, fallMax: 8 },
  5: { trees: 5, fruitsPerTree: 3, dropInterval: 8, fallMin: 4, fallMax: 7 },
  6: { trees: 6, fruitsPerTree: 3, dropInterval: 6, fallMin: 3, fallMax: 6 },
  7: { trees: 6, fruitsPerTree: 4, dropInterval: 6, fallMin: 3, fallMax: 5 },
};

const ASSETS = {
  background: '/background/ChatGPT%20Image%20Jul%201,%202026,%2009_56_02%20PM.png',
  tree: '/item/cay.png',
  rauLang: '/item/Screenshot_2026-07-01_220320-removebg-preview.png',
  fruits: [
    { id: 'xoai', src: '/item/xoai.png', label: 'Xoai' },
    { id: 'oi', src: '/item/oi.png', label: 'Oi' },
    { id: 'man', src: '/item/man.png', label: 'Man' },
  ],
  character: {
    run: '/characters/run.png',
    catch: '/characters/catching.png',
    right: '/characters/lan_anh_walk_right.png',
    down: '/characters/lan_anh_walk_down.png',
    up: '/characters/lan_anh_walk_up.png',
  },
};

const SOUND_ASSETS = {
  background: '/sound/nhac_nen.mp3',
  magnet: '/sound/nam_cham_sound.wav',
  prize: '/sound/prize.wav',
  fruitCollision: '/sound/fruit_collision.wav',
  manyFruitCollision: '/sound/many_fruit_collison.wav',
};

const LAN_ANH_SPRITES = {
  run: { cols: 2, rows: 2, frameWidth: 150, frameHeight: 150 },
  right: { cols: 4, rows: 1, frameWidth: 184, frameHeight: 132 },
  down: { cols: 4, rows: 1, frameWidth: 184, frameHeight: 130 },
  up: { cols: 4, rows: 1, frameWidth: 184, frameHeight: 132 },
  catch: { cols: 1, rows: 1, frameWidth: 250, frameHeight: 250 },
};

const TREE_LAYOUT = [
  { x: 96, y: 254, scale: 0.64, fruit: 'oi' },
  { x: 266, y: 178, scale: 0.7, fruit: 'xoai' },
  { x: 455, y: 276, scale: 0.68, fruit: 'man' },
  { x: 640, y: 130, scale: 0.74, fruit: 'xoai' },
  { x: 780, y: 284, scale: 0.68, fruit: 'oi' },
  { x: 955, y: 132, scale: 0.74, fruit: 'man' },
  { x: 1094, y: 256, scale: 0.66, fruit: 'xoai' },
  { x: 292, y: 432, scale: 0.66, fruit: 'oi' },
  { x: 620, y: 430, scale: 0.66, fruit: 'man' },
  { x: 928, y: 438, scale: 0.68, fruit: 'xoai' },
  { x: 138, y: 597, scale: 0.64, fruit: 'man' },
  { x: 462, y: 620, scale: 0.65, fruit: 'xoai' },
  { x: 770, y: 620, scale: 0.68, fruit: 'oi' },
  { x: 1104, y: 610, scale: 0.64, fruit: 'man' },
];

const RAU_LANG_ROWS = [
  { x: 104, y: 258, width: 1000, height: 68 },
  { x: 104, y: 421, width: 1000, height: 68 },
  { x: 104, y: 586, width: 1000, height: 68 },
];

const FRUIT_ANCHORS = [
  [-72, -124],
  [-34, -158],
  [18, -144],
  [60, -108],
  [-5, -86],
];

const TREE_ROWS = [
  [0, 1, 2, 3, 4, 5, 6],
  [7, 8, 9],
  [10, 11, 12, 13],
];

const KEY_DIRECTIONS = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pointInRect(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

function isBlocked(point) {
  return RAU_LANG_ROWS.some((row) => pointInRect(point, row));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function makeInitialState() {
  return {
    timeRemaining: TOTAL_TIME,
    currentPhase: 1,
    dropTimer: 9.4,
    collected: 0,
    isRunning: true,
    success: false,
    gameOver: false,
    nextFruitId: 1,
    hangingFruits: [],
    fallingFruits: [],
    collectEffects: [],
    treePulses: TREE_LAYOUT.map(() => 0),
    emptyTreeTimers: TREE_LAYOUT.map(() => 0),
    magnetBasketCounter: 0,
    rowRain: {
      rowIndex: 0,
      status: 'cooldown',
      countdown: ROW_RAIN_COUNTDOWN,
      cooldown: 24,
      pulse: 0,
    },
    powerEffects: {
      magnet: 0,
      timeStop: 0,
    },
    catchPulse: 0,
    uiSecond: TOTAL_TIME,
    lanAnh: {
      x: 215,
      y: 710,
      direction: 'right',
      lastVector: { x: 1, y: 0 },
      moving: false,
      pressingMove: false,
      sprinting: false,
      isJumping: false,
      canJump: true,
      jumpElapsed: 0,
      jumpDuration: 0.28,
      jumpStart: { x: 215, y: 710 },
      jumpTarget: { x: 215, y: 710 },
    },
  };
}

function makeFruitDrop(state, treeIndex, config, quick = false, sourceX = null, sourceY = null) {
  const tree = TREE_LAYOUT[treeIndex];
  const fruitSize = 66 * tree.scale;
  const spread = 74 * tree.scale;
  const x = sourceX ?? tree.x + randomBetween(-spread, spread);
  const startY = sourceY ?? tree.y - 165 * tree.scale;
  const endY = tree.y + 132 * tree.scale;
  const fallTime = quick
    ? 0.75
    : Math.max(1, randomBetween(config.fallMin, config.fallMax) * FALL_TIME_SCALE);

  state.fallingFruits.push({
    id: state.nextFruitId,
    treeIndex,
    type: tree.fruit,
    x,
    startY,
    y: startY,
    endY,
    elapsed: 0,
    fallTime,
    size: fruitSize,
  });
  state.nextFruitId += 1;
}

function makeRainFruitDrop(state, treeIndex, anchorIndex, delay = 0) {
  const tree = TREE_LAYOUT[treeIndex];
  const anchor = FRUIT_ANCHORS[anchorIndex];
  const fruitSize = 70 * tree.scale;
  const startX = tree.x + anchor[0] * tree.scale + randomBetween(-10, 10);
  const startY = tree.y + anchor[1] * tree.scale;
  const endY = tree.y + 156 * tree.scale;

  state.fallingFruits.push({
    id: state.nextFruitId,
    treeIndex,
    type: tree.fruit,
    x: startX,
    startY,
    y: startY,
    endY,
    elapsed: -delay,
    fallTime: randomBetween(1.15, 1.9),
    size: fruitSize,
    rain: true,
  });
  state.nextFruitId += 1;
}

function spawnHangingFruit(state, treeIndex, config, quick = false) {
  const tree = TREE_LAYOUT[treeIndex];
  const activeAnchors = new Set(
    state.hangingFruits
      .filter((fruit) => fruit.treeIndex === treeIndex)
      .map((fruit) => fruit.anchorIndex),
  );
  const availableAnchors = FRUIT_ANCHORS
    .map((anchor, anchorIndex) => ({ anchor, anchorIndex }))
    .filter((item) => !activeAnchors.has(item.anchorIndex));
  const selected = availableAnchors.length > 0
    ? availableAnchors[Math.floor(Math.random() * availableAnchors.length)]
    : (() => {
      const anchorIndex = Math.floor(Math.random() * FRUIT_ANCHORS.length);
      return { anchor: FRUIT_ANCHORS[anchorIndex], anchorIndex };
    })();
  const countdown = quick ? 3.2 : randomBetween(HANGING_COUNTDOWN_MIN, HANGING_COUNTDOWN_MAX);

  state.hangingFruits.push({
    id: state.nextFruitId,
    treeIndex,
    type: tree.fruit,
    anchorIndex: selected.anchorIndex,
    offsetX: selected.anchor[0] * tree.scale,
    offsetY: selected.anchor[1] * tree.scale,
    countdown,
    totalCountdown: countdown,
    quick,
  });
  state.nextFruitId += 1;
}

function triggerDrop(state) {
  const config = PHASE_CONFIG[state.currentPhase];
  const activeTrees = shuffle(TREE_LAYOUT.map((_, index) => index).filter((index) => canTreeSpawnFruit(state, index)))
    .slice(0, config.trees);

  for (const treeIndex of activeTrees) {
    for (let fruit = 0; fruit < config.fruitsPerTree; fruit += 1) {
      spawnHangingFruit(state, treeIndex, config);
    }
  }
}

function drawSprite(ctx, image, config, frame, x, y, width, height, flip = false) {
  const sourceX = (frame % config.cols) * config.frameWidth;
  const sourceY = Math.floor(frame / config.cols) * config.frameHeight;

  ctx.save();
  if (flip) {
    ctx.translate(x + width, y);
    ctx.scale(-1, 1);
    x = 0;
    y = 0;
  }

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    config.frameWidth,
    config.frameHeight,
    x,
    y,
    width,
    height,
  );
  ctx.restore();
}

const OrchardCanvas = forwardRef(function OrchardCanvas({ command, resetKey, onStatsChange, onHarvest }, ref) {
  const canvasRef = useRef(null);
  const keysRef = useRef(new Set());
  const stateRef = useRef(makeInitialState());
  const assetsRef = useRef(null);

  const fruitMeta = useMemo(() => Object.fromEntries(ASSETS.fruits.map((fruit) => [fruit.id, fruit])), []);

  useEffect(() => {
    stateRef.current = makeInitialState();
    onStatsChange?.(summarizeState(stateRef.current));
  }, [resetKey]);

  useEffect(() => {
    let active = true;

    Promise.all([
      loadImage(ASSETS.background),
      loadImage(ASSETS.tree),
      loadImage(ASSETS.rauLang),
      loadImage(ASSETS.character.run),
      loadImage(ASSETS.character.catch),
      loadImage(ASSETS.character.right),
      loadImage(ASSETS.character.down),
      loadImage(ASSETS.character.up),
      ...ASSETS.fruits.map((fruit) => loadImage(fruit.src)),
    ]).then(([background, tree, rauLang, run, catchImage, right, down, up, ...fruits]) => {
      if (!active) return;
      assetsRef.current = {
        background,
        tree,
        rauLang,
        character: { run, catch: catchImage, right, down, up },
        fruits: Object.fromEntries(ASSETS.fruits.map((fruit, index) => [fruit.id, fruits[index]])),
      };
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (
        KEY_DIRECTIONS[event.code] ||
        event.code === 'Space' ||
        event.code === 'KeyQ' ||
        event.code === 'ShiftLeft' ||
        event.code === 'ShiftRight'
      ) {
        event.preventDefault();
      }
      keysRef.current.add(event.code);
    };
    const onKeyUp = (event) => {
      keysRef.current.delete(event.code);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!command) return;
    const codeByCommand = {
      left: 'ArrowLeft',
      right: 'ArrowRight',
      up: 'ArrowUp',
      down: 'ArrowDown',
      jump: 'Space',
      shake: 'KeyQ',
    };
    const code = codeByCommand[command.name];
    if (!code) return;
    keysRef.current.add(code);
    const timer = window.setTimeout(() => keysRef.current.delete(code), command.name === 'jump' || command.name === 'shake' ? 120 : 150);
    return () => window.clearTimeout(timer);
  }, [command]);

  useEffect(() => {
    let animationId = 0;
    let previous = performance.now();

    const update = (now) => {
      const delta = Math.min((now - previous) / 1000, 0.04);
      previous = now;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const assets = assetsRef.current;
      if (!canvas || !ctx || !assets) {
        animationId = requestAnimationFrame(update);
        return;
      }

      const state = stateRef.current;
      updateGame(state, keysRef.current, delta, fruitMeta, onHarvest, onStatsChange);
      paint(ctx, assets, state, now / 1000);
      animationId = requestAnimationFrame(update);
    };

    animationId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationId);
  }, [fruitMeta, onHarvest, onStatsChange]);

  useImperativeHandle(ref, () => ({
    triggerNearestRowRain: () => {
      const state = stateRef.current;
      if (!state.isRunning) return false;
      const rowIndex = nearestRowIndex(state);
      triggerRowRain(state, rowIndex);
      state.rowRain.pulse = 1;
      return true;
    },
    activateMagnet: () => {
      const state = stateRef.current;
      if (!state.isRunning) return false;
      state.powerEffects.magnet = MAGNET_DURATION;
      state.catchPulse = 0.5;
      return true;
    },
    triggerTimeStopRain: () => {
      const state = stateRef.current;
      if (!state.isRunning) return false;
      triggerPowerFruitStorm(state);
      state.powerEffects.timeStop = TIME_STOP_DURATION;
      state.rowRain.pulse = 1;
      return true;
    },
  }), []);

  return <canvas ref={canvasRef} width={WORLD.width} height={WORLD.height} className="orchard-canvas" />;
});

function summarizeState(state) {
  return {
    harvested: state.collected,
    target: TARGET_FRUITS,
    remaining: Math.max(0, TARGET_FRUITS - state.collected),
    phase: state.currentPhase,
    timeRemaining: Math.max(0, Math.ceil(state.timeRemaining)),
    success: state.success,
    gameOver: state.gameOver,
  };
}

function updateGame(state, pressed, delta, fruitMeta, onHarvest, onStatsChange) {
  if (!state.isRunning) return;

  state.timeRemaining -= delta;
  if (state.timeRemaining <= 0) {
    state.timeRemaining = 0;
    state.isRunning = false;
    state.gameOver = true;
    onStatsChange?.(summarizeState(state));
    return;
  }

  const nextPhase = clamp(Math.floor((TOTAL_TIME - state.timeRemaining) / 60) + 1, 1, 7);
  if (nextPhase !== state.currentPhase) {
    state.currentPhase = nextPhase;
    state.dropTimer = 0;
  }

  state.dropTimer += delta;
  if (state.dropTimer >= PHASE_CONFIG[state.currentPhase].dropInterval) {
    state.dropTimer = 0;
    triggerDrop(state);
  }

  updatePlayer(state, pressed, delta);
  updateRowRain(state, delta);
  updateHangingFruits(state, delta);
  updateFruits(state, delta, fruitMeta, onHarvest, onStatsChange);
  updateCollectEffects(state, delta);

  state.powerEffects.magnet = Math.max(0, state.powerEffects.magnet - delta);
  state.powerEffects.timeStop = Math.max(0, state.powerEffects.timeStop - delta);

  for (let index = 0; index < state.treePulses.length; index += 1) {
    state.treePulses[index] = Math.max(0, state.treePulses[index] - delta);
    state.emptyTreeTimers[index] = Math.max(0, state.emptyTreeTimers[index] - delta);
  }
  state.catchPulse = Math.max(0, state.catchPulse - delta);
  state.rowRain.pulse = Math.max(0, state.rowRain.pulse - delta);

  const uiSecond = Math.ceil(state.timeRemaining);
  if (uiSecond !== state.uiSecond) {
    state.uiSecond = uiSecond;
    onStatsChange?.(summarizeState(state));
  }
}

function updateRowRain(state, delta) {
  const rain = state.rowRain;

  if (state.currentPhase === 1) {
    rain.status = 'cooldown';
    rain.cooldown = Math.max(rain.cooldown, 8);
    return;
  }

  if (rain.status === 'countdown') {
    rain.countdown -= delta;
    if (rain.countdown <= 0) {
      triggerRowRain(state, rain.rowIndex);
      rain.status = 'cooldown';
      rain.cooldown = ROW_RAIN_COOLDOWN;
      rain.pulse = 1;
    }
    return;
  }

  rain.cooldown -= delta;
  if (rain.cooldown <= 0) {
    rain.rowIndex = (rain.rowIndex + 1) % TREE_ROWS.length;
    rain.status = 'countdown';
    rain.countdown = ROW_RAIN_COUNTDOWN;
  }
}

function triggerRowRain(state, rowIndex) {
  const treeIndexes = TREE_ROWS[rowIndex];

  for (const treeIndex of treeIndexes) {
    if (!canTreeSpawnFruit(state, treeIndex)) continue;
    state.treePulses[treeIndex] = 0.55;
    for (const anchorIndex of FRUIT_ANCHORS.keys()) {
      makeRainFruitDrop(state, treeIndex, anchorIndex, randomBetween(0, 0.6));
    }
  }
}

function triggerPowerFruitStorm(state) {
  const nearest = nearestRowIndex(state);
  const rowDistances = TREE_ROWS
    .map((treeIndexes, rowIndex) => {
      const avgY = treeIndexes.reduce((sum, index) => sum + TREE_LAYOUT[index].y, 0) / treeIndexes.length;
      return { rowIndex, distance: Math.abs(avgY - state.lanAnh.y) };
    })
    .sort((a, b) => a.distance - b.distance);
  const selectedRows = state.currentPhase >= 5
    ? rowDistances.slice(0, 2).map((item) => item.rowIndex)
    : [nearest];

  for (const rowIndex of selectedRows) {
    for (const treeIndex of TREE_ROWS[rowIndex]) {
      if (!canTreeSpawnFruit(state, treeIndex)) continue;
      state.treePulses[treeIndex] = 0.8;
      for (const anchorIndex of shuffle([...FRUIT_ANCHORS.keys()]).slice(0, 3)) {
        makeRainFruitDrop(state, treeIndex, anchorIndex, randomBetween(0, 0.7));
      }
    }
  }
}

function nearestRowIndex(state) {
  const lanAnhY = state.lanAnh.y;
  let bestIndex = 0;
  let bestDistance = Infinity;

  TREE_ROWS.forEach((treeIndexes, rowIndex) => {
    const avgY = treeIndexes.reduce((sum, index) => sum + TREE_LAYOUT[index].y, 0) / treeIndexes.length;
    const rowDistance = Math.abs(avgY - lanAnhY);
    if (rowDistance < bestDistance) {
      bestDistance = rowDistance;
      bestIndex = rowIndex;
    }
  });

  return bestIndex;
}

function updatePlayer(state, pressed, delta) {
  const lanAnh = state.lanAnh;

  if (pressed.has('Space') && lanAnh.canJump && !lanAnh.isJumping) {
    startJump(lanAnh);
    pressed.delete('Space');
  }

  if (pressed.has('KeyQ')) {
    shakeNearestTree(state);
    pressed.delete('KeyQ');
  }

  if (lanAnh.isJumping) {
    lanAnh.jumpElapsed += delta;
    const progress = clamp(lanAnh.jumpElapsed / lanAnh.jumpDuration, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 2);
    lanAnh.x = lanAnh.jumpStart.x + (lanAnh.jumpTarget.x - lanAnh.jumpStart.x) * eased;
    lanAnh.y = lanAnh.jumpStart.y + (lanAnh.jumpTarget.y - lanAnh.jumpStart.y) * eased;

    if (progress >= 1) {
      lanAnh.isJumping = false;
      resolveBlockedPosition(lanAnh);
      window.setTimeout(() => {
        lanAnh.canJump = true;
      }, 350);
    }
    return;
  }

  const directionCodes = Array.from(pressed).map((code) => KEY_DIRECTIONS[code]).filter(Boolean);
  let dx = 0;
  let dy = 0;
  lanAnh.pressingMove = directionCodes.length > 0;
  for (const direction of directionCodes) {
    if (direction === 'up') dy -= 1;
    if (direction === 'down') dy += 1;
    if (direction === 'left') dx -= 1;
    if (direction === 'right') dx += 1;
    lanAnh.direction = direction;
  }

  const length = Math.hypot(dx, dy) || 1;
  if (dx !== 0 || dy !== 0) {
    lanAnh.lastVector = { x: dx / length, y: dy / length };
  }

  const sprinting = pressed.has('ShiftLeft') || pressed.has('ShiftRight');
  const speedBoost = state.powerEffects.timeStop > 0 ? 1.3 : 1;
  const speed = (sprinting ? 330 : 140) * speedBoost;
  lanAnh.moving = dx !== 0 || dy !== 0;
  lanAnh.sprinting = sprinting && lanAnh.moving;

  const nextX = clamp(lanAnh.x + (dx / length) * speed * delta, 68, WORLD.width - 68);
  const nextY = clamp(lanAnh.y + (dy / length) * speed * delta, 112, WORLD.height - 68);
  resolveBlockedPosition(lanAnh);
  moveWithRauLangCollision(lanAnh, nextX, nextY);
}

function updateHangingFruits(state, delta) {
  const config = PHASE_CONFIG[state.currentPhase];
  const stillHanging = [];

  for (const fruit of state.hangingFruits) {
    fruit.countdown -= delta;

    if (fruit.countdown <= 0) {
      const tree = TREE_LAYOUT[fruit.treeIndex];
      makeFruitDrop(state, fruit.treeIndex, config, fruit.quick, tree.x + fruit.offsetX, tree.y + fruit.offsetY);
    } else {
      stillHanging.push(fruit);
    }
  }

  state.hangingFruits = stillHanging;
}

function updateCollectEffects(state, delta) {
  state.collectEffects = state.collectEffects
    .map((effect) => ({
      ...effect,
      life: effect.life - delta,
      y: effect.y - 28 * delta,
    }))
    .filter((effect) => effect.life > 0);
}

function moveWithRauLangCollision(lanAnh, nextX, nextY) {
  resolveBlockedPosition(lanAnh);

  const current = { x: lanAnh.x, y: lanAnh.y };
  const horizontal = { x: nextX, y: current.y };
  const vertical = { x: lanAnh.x, y: nextY };
  const both = { x: nextX, y: nextY };

  if (!isBlocked(horizontal)) {
    lanAnh.x = nextX;
  }
  if (!isBlocked(vertical)) {
    lanAnh.y = nextY;
  }
  if (!isBlocked(both)) {
    lanAnh.x = nextX;
    lanAnh.y = nextY;
  }
}

function resolveBlockedPosition(lanAnh) {
  const current = { x: lanAnh.x, y: lanAnh.y };
  if (!isBlocked(current)) return;

  for (const row of RAU_LANG_ROWS) {
    if (!pointInRect(current, row)) continue;

    const topExit = row.y - 3;
    const bottomExit = row.y + row.height + 3;
    const topDistance = Math.abs(current.y - topExit);
    const bottomDistance = Math.abs(bottomExit - current.y);
    lanAnh.y = clamp(topDistance <= bottomDistance ? topExit : bottomExit, 112, WORLD.height - 68);
    return;
  }
}

function findSafeJumpTarget(start, rawTarget) {
  if (!isBlocked(rawTarget)) return rawTarget;

  for (let step = 9; step >= 1; step -= 1) {
    const ratio = step / 10;
    const candidate = {
      x: start.x + (rawTarget.x - start.x) * ratio,
      y: start.y + (rawTarget.y - start.y) * ratio,
    };
    if (!isBlocked(candidate)) return candidate;
  }

  return start;
}

function startJump(lanAnh) {
  resolveBlockedPosition(lanAnh);
  lanAnh.canJump = false;
  lanAnh.isJumping = true;
  lanAnh.jumpElapsed = 0;
  lanAnh.jumpStart = { x: lanAnh.x, y: lanAnh.y };
  const rawTarget = {
    x: clamp(lanAnh.x + lanAnh.lastVector.x * JUMP_DISTANCE, 68, WORLD.width - 68),
    y: clamp(lanAnh.y + lanAnh.lastVector.y * JUMP_DISTANCE, 112, WORLD.height - 68),
  };
  lanAnh.jumpTarget = findSafeJumpTarget(lanAnh.jumpStart, rawTarget);
}

function shakeNearestTree(state) {
  const nearest = nearestTree(state.lanAnh);
  if (!nearest || nearest.distance > 132) return;

  if (state.powerEffects.magnet > 0) {
    dropAllFruitFromTree(state, nearest.index);
    return;
  }

  state.treePulses[nearest.index] = 0.34;
  const hangingFruits = state.hangingFruits.filter((fruit) => fruit.treeIndex === nearest.index);
  for (const fruit of hangingFruits) {
    fruit.countdown = Math.max(0.5, fruit.countdown - 2.4);
    fruit.quick = true;
  }
}

function dropAllFruitFromTree(state, treeIndex) {
  if (!canTreeSpawnFruit(state, treeIndex)) return;

  const config = PHASE_CONFIG[state.currentPhase];
  const tree = TREE_LAYOUT[treeIndex];

  state.treePulses[treeIndex] = 0.72;
  state.emptyTreeTimers[treeIndex] = MAGNET_TREE_REFILL_DELAY;
  state.hangingFruits = state.hangingFruits.filter((fruit) => fruit.treeIndex !== treeIndex);

  for (const anchor of FRUIT_ANCHORS) {
    makeFruitDrop(
      state,
      treeIndex,
      config,
      true,
      tree.x + anchor[0] * tree.scale + randomBetween(-6, 6),
      tree.y + anchor[1] * tree.scale + randomBetween(-4, 4),
    );
  }
}

function canTreeSpawnFruit(state, treeIndex) {
  return state.emptyTreeTimers[treeIndex] <= 0;
}

function nearestTree(lanAnh) {
  return TREE_LAYOUT.map((tree, index) => ({
    index,
    tree,
    distance: distance({ x: lanAnh.x, y: lanAnh.y }, { x: tree.x, y: tree.y + 80 * tree.scale }),
  })).sort((a, b) => a.distance - b.distance)[0];
}

function updateFruits(state, delta, fruitMeta, onHarvest, onStatsChange) {
  const remaining = [];

  for (const fruit of state.fallingFruits) {
    if (fruit.magnetized && state.powerEffects.magnet <= 0) {
      releaseMagnetizedFruit(fruit);
    }

    const holdY = fruit.endY - 74;
    const shouldHold = !fruit.magnetized && state.powerEffects.timeStop > 0 && fruit.y >= holdY;

    if (!shouldHold) {
      fruit.elapsed += delta;
    }

    const progress = clamp(fruit.elapsed / fruit.fallTime, 0, 1);
    let heldByTimeStop = false;

    if (!fruit.magnetized) {
      const eased = progress * progress;
      fruit.y = fruit.startY + (fruit.endY - fruit.startY) * eased;

      if (state.powerEffects.timeStop > 0 && fruit.y >= holdY) {
        fruit.y = holdY + Math.sin(performance.now() / 180 + fruit.id) * 3;
        heldByTimeStop = true;
      }
    }

    if (state.powerEffects.magnet > 0) {
      pullFruitTowardPlayer(state, fruit, delta);
    }

    if (isFruitTouchingPlayer(state, fruit)) {
      const magnetHarvest = fruit.magnetized;
      state.collected += 1;
      state.catchPulse = 0.38;
      state.collectEffects.push({
        x: state.lanAnh.x,
        y: state.lanAnh.y - 128,
        life: 0.72,
        maxLife: 0.72,
      });
      onHarvest?.(fruitMeta[fruit.type], {
        addToBasket: !magnetHarvest || shouldAddMagnetFruitToBasket(state),
        magnetHarvest,
      });
      if (state.collected >= TARGET_FRUITS) {
        state.success = true;
      }
      onStatsChange?.(summarizeState(state));
      continue;
    }

    if (progress < 1 || heldByTimeStop || fruit.magnetized) {
      remaining.push(fruit);
    }
  }

  state.fallingFruits = remaining;
}

function shouldAddMagnetFruitToBasket(state) {
  state.magnetBasketCounter += 1;
  return state.magnetBasketCounter % MAGNET_BASKET_SKIP_INTERVAL !== 0;
}

function releaseMagnetizedFruit(fruit) {
  fruit.magnetized = false;
  fruit.startY = fruit.y;
  fruit.endY = Math.max(fruit.endY, Math.min(WORLD.height - 42, fruit.y + 96));
  fruit.elapsed = 0;
  fruit.fallTime = 0.85;
}

function playerCatchPoint(state) {
  return {
    x: state.lanAnh.x,
    y: state.lanAnh.y - 92,
  };
}

function pullFruitTowardPlayer(state, fruit, delta) {
  const target = playerCatchPoint(state);
  const fruitDistance = distance(target, fruit);

  if (fruit.elapsed < 0) return;
  if (!fruit.magnetized && fruitDistance > MAGNET_RADIUS) return;

  fruit.magnetized = true;
  if (fruitDistance <= 1) return;

  const speed = clamp(560 + fruitDistance * 3.2, 620, 1500);
  const step = Math.min(fruitDistance, speed * delta);
  const ratio = step / fruitDistance;

  fruit.x += (target.x - fruit.x) * ratio;
  fruit.y += (target.y - fruit.y) * ratio;
}

function isFruitTouchingPlayer(state, fruit) {
  const lanAnh = state.lanAnh;
  const fruitRadius = fruit.size * (fruit.magnetized ? 0.46 : 0.38);
  const playerRect = {
    left: lanAnh.x - 42,
    right: lanAnh.x + 42,
    top: lanAnh.y - (lanAnh.isJumping ? 158 : 142),
    bottom: lanAnh.y - 18,
  };

  const closestX = clamp(fruit.x, playerRect.left, playerRect.right);
  const closestY = clamp(fruit.y, playerRect.top, playerRect.bottom);
  return distance({ x: closestX, y: closestY }, fruit) <= fruitRadius;
}

function paint(ctx, assets, state, time) {
  ctx.clearRect(0, 0, WORLD.width, WORLD.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(assets.background, 0, 0, WORLD.width, WORLD.height);
  drawRauLang(ctx, assets);
  drawRowRainWarning(ctx, state);

  const drawQueue = TREE_LAYOUT.map((tree, index) => ({
    kind: 'tree',
    index,
    sortY: tree.y + 105 * tree.scale,
  }));

  drawQueue.push({ kind: 'lanAnh', sortY: state.lanAnh.y });
  drawQueue.sort((a, b) => a.sortY - b.sortY);

  for (const item of drawQueue) {
    if (item.kind === 'tree') {
      drawTree(ctx, assets, state, TREE_LAYOUT[item.index], item.index);
    } else {
      drawLanAnh(ctx, assets, state, time);
    }
  }

  for (const fruit of state.fallingFruits) {
    drawFallingFruit(ctx, assets, fruit, time);
  }

  for (const effect of state.collectEffects) {
    drawCollectEffect(ctx, effect);
  }

  drawPowerEffects(ctx, state);

  if (state.success && !state.gameOver) {
    drawSuccessNotice(ctx, state);
  }

  if (state.gameOver) {
    drawResult(ctx, state);
  }
}

function drawRauLang(ctx, assets) {
  for (const row of RAU_LANG_ROWS) {
    ctx.drawImage(assets.rauLang, row.x, row.y, row.width, row.height);
  }
}

function drawRowRainWarning(ctx, state) {
  const rain = state.rowRain;
  const treeIndexes = TREE_ROWS[rain.rowIndex];
  const rowTrees = treeIndexes.map((index) => TREE_LAYOUT[index]);
  const minY = Math.min(...rowTrees.map((tree) => tree.y - 210 * tree.scale));
  const maxY = Math.max(...rowTrees.map((tree) => tree.y + 180 * tree.scale));
  const alpha = rain.status === 'countdown'
    ? 0.18 + Math.sin(performance.now() / 160) * 0.08
    : rain.pulse * 0.22;

  if (alpha <= 0) return;

  ctx.save();
  ctx.fillStyle = `rgba(255, 206, 72, ${alpha})`;
  ctx.fillRect(40, minY, WORLD.width - 80, maxY - minY);
  ctx.strokeStyle = `rgba(255, 235, 140, ${Math.min(0.8, alpha * 3)})`;
  ctx.lineWidth = 3;
  ctx.strokeRect(40, minY, WORLD.width - 80, maxY - minY);

  if (rain.status === 'countdown') {
    ctx.fillStyle = 'rgba(38, 43, 28, 0.86)';
    ctx.strokeStyle = 'rgba(255, 236, 142, 0.78)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(WORLD.width / 2 - 66, minY + 12, 132, 42, 7);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff2a8';
    ctx.font = '900 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Mua qua ${Math.ceil(rain.countdown)}`, WORLD.width / 2, minY + 33);
  }

  ctx.restore();
}

function drawTree(ctx, assets, state, tree, treeIndex) {
  const pulse = state.treePulses[treeIndex];
  const scale = tree.scale * (pulse > 0 ? 1 + Math.sin(pulse * 44) * 0.018 : 1);
  const width = 451 * scale;
  const height = 554 * scale;
  const x = tree.x - width / 2;
  const y = tree.y - height * 0.76;
  ctx.drawImage(assets.tree, x, y, width, height);

  const hanging = state.hangingFruits.filter((fruit) => fruit.treeIndex === treeIndex);
  drawStaticFruits(ctx, assets, tree, hanging, state.emptyTreeTimers[treeIndex] > 0);
  for (const fruit of hanging) {
    drawHangingFruit(ctx, assets, tree, fruit);
  }
}

function drawStaticFruits(ctx, assets, tree, activeFruits, hideAll = false) {
  if (hideAll) return;

  const activeAnchors = new Set(activeFruits.map((fruit) => fruit.anchorIndex));
  const size = 44 * tree.scale;

  ctx.save();
  ctx.globalAlpha = 0.9;
  for (const [anchorIndex, anchor] of FRUIT_ANCHORS.entries()) {
    if (activeAnchors.has(anchorIndex)) continue;

    const x = tree.x + anchor[0] * tree.scale;
    const y = tree.y + anchor[1] * tree.scale;
    ctx.drawImage(assets.fruits[tree.fruit], x - size / 2, y - size / 2, size, size);
  }
  ctx.restore();
}

function drawHangingFruit(ctx, assets, tree, fruit) {
  const x = tree.x + fruit.offsetX;
  const y = tree.y + fruit.offsetY;
  const size = 72 * tree.scale;
  const label = Math.ceil(fruit.countdown);
  const blink = 0.45 + Math.sin(performance.now() / 120 + fruit.id) * 0.35;

  ctx.save();
  ctx.shadowColor = 'rgba(30, 24, 15, 0.34)';
  ctx.shadowBlur = 7;
  ctx.shadowOffsetY = 5;
  ctx.drawImage(assets.fruits[fruit.type], x - size / 2, y - size / 2, size, size);
  ctx.shadowColor = 'transparent';

  ctx.fillStyle = 'rgba(37, 45, 28, 0.84)';
  ctx.strokeStyle = 'rgba(255, 244, 178, 0.74)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x - 12, y - size / 2 - 24, 24, 20, 5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fff4a8';
  ctx.font = '800 14px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y - size / 2 - 14);

  ctx.globalAlpha = clamp(blink, 0.15, 1);
  ctx.fillStyle = '#ff2f2f';
  ctx.strokeStyle = '#fff0d5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + size * 0.32, y - size * 0.35, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawFallingFruit(ctx, assets, fruit, time) {
  const bob = Math.sin(time * 5 + fruit.id) * 1.5;
  ctx.save();
  ctx.shadowColor = 'rgba(30, 24, 15, 0.32)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 6;
  ctx.drawImage(assets.fruits[fruit.type], fruit.x - fruit.size / 2, fruit.y - fruit.size / 2 + bob, fruit.size, fruit.size);
  ctx.restore();
}

function drawCollectEffect(ctx, effect) {
  const progress = 1 - effect.life / effect.maxLife;
  const radius = 13 + progress * 8;
  const alpha = Math.max(0, effect.life / effect.maxLife);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(effect.x, effect.y);
  ctx.rotate(progress * Math.PI * 1.4);
  ctx.fillStyle = '#ffe66f';
  ctx.strokeStyle = '#fff8bd';
  ctx.lineWidth = 3;
  ctx.beginPath();

  for (let point = 0; point < 10; point += 1) {
    const angle = -Math.PI / 2 + point * (Math.PI / 5);
    const length = point % 2 === 0 ? radius : radius * 0.46;
    const x = Math.cos(angle) * length;
    const y = Math.sin(angle) * length;
    if (point === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawPowerEffects(ctx, state) {
  const magnetTime = state.powerEffects.magnet;
  const timeStopTime = state.powerEffects.timeStop;

  if (magnetTime > 0) {
    const pulse = 0.5 + Math.sin(performance.now() / 120) * 0.12;
    ctx.save();
    ctx.globalAlpha = 0.22 + pulse * 0.16;
    ctx.strokeStyle = '#9ff7ff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(state.lanAnh.x, state.lanAnh.y - 82, MAGNET_RADIUS * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = 'rgba(24, 55, 54, 0.72)';
    ctx.strokeStyle = 'rgba(170, 255, 246, 0.82)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(state.lanAnh.x - 54, state.lanAnh.y - 178, 108, 30, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#d7fff8';
    ctx.font = '900 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`NAM CHAM ${Math.ceil(magnetTime)}`, state.lanAnh.x, state.lanAnh.y - 163);
    ctx.restore();
  }

  if (timeStopTime > 0) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#6fd6ff';
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(18, 37, 48, 0.76)';
    ctx.strokeStyle = 'rgba(181, 239, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(WORLD.width / 2 - 88, 72, 176, 36, 9);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e1fbff';
    ctx.font = '900 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`DUNG TG ${Math.ceil(timeStopTime)}`, WORLD.width / 2, 90);
    ctx.restore();
  }
}

function drawSuccessNotice(ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(35, 52, 28, 0.82)';
  ctx.strokeStyle = 'rgba(255, 232, 128, 0.86)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(WORLD.width / 2 - 148, 116, 296, 48, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fff4b8';
  ctx.font = '900 18px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Chien thang - da pass', WORLD.width / 2, 134);

  ctx.fillStyle = 'rgba(255, 251, 224, 0.82)';
  ctx.font = '800 13px Inter, sans-serif';
  ctx.fillText(`Tiep tuc hai: ${state.collected}/${TARGET_FRUITS}`, WORLD.width / 2, 153);
  ctx.restore();
}

function drawLanAnh(ctx, assets, state, time) {
  const lanAnh = state.lanAnh;
  const nearTree = nearestTree(lanAnh)?.distance < 118;
  const catching = state.catchPulse > 0 || (nearTree && !lanAnh.pressingMove && !lanAnh.isJumping);
  const jumpLift = lanAnh.isJumping ? Math.sin(clamp(lanAnh.jumpElapsed / lanAnh.jumpDuration, 0, 1) * Math.PI) * 40 : 0;
  const frameTime = Math.floor(time * (lanAnh.sprinting ? 12 : 8));

  if (catching) {
    const size = 84 * CHARACTER_SCALE;
    drawSprite(
      ctx,
      assets.character.catch,
      LAN_ANH_SPRITES.catch,
      0,
      lanAnh.x - size / 2,
      lanAnh.y - size + 12 - jumpLift,
      size,
      size,
    );
    return;
  }

  if (lanAnh.sprinting && Math.abs(lanAnh.lastVector.x) >= Math.abs(lanAnh.lastVector.y)) {
    const size = 94 * CHARACTER_SCALE;
    drawSprite(
      ctx,
      assets.character.run,
      LAN_ANH_SPRITES.run,
      frameTime % 4,
      lanAnh.x - size / 2,
      lanAnh.y - size + 14 - jumpLift,
      size,
      size,
      lanAnh.direction === 'left',
    );
    return;
  }

  const spriteKey = lanAnh.direction === 'left' ? 'right' : lanAnh.direction;
  const config = LAN_ANH_SPRITES[spriteKey];
  const frame = lanAnh.moving || lanAnh.isJumping ? frameTime % config.cols : 0;
  const width = 96 * CHARACTER_SCALE;
  const height = (spriteKey === 'down' ? 68 : 70) * CHARACTER_SCALE;
  drawSprite(
    ctx,
    assets.character[spriteKey],
    config,
    frame,
    lanAnh.x - width / 2,
    lanAnh.y - height + 8 - jumpLift,
    width,
    height,
    lanAnh.direction === 'left',
  );
}

function drawResult(ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(31, 36, 28, 0.72)';
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  ctx.fillStyle = '#fff7c6';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 48px Inter, sans-serif';
  ctx.fillText(state.success ? 'Thanh cong' : 'Het gio', WORLD.width / 2, WORLD.height / 2 - 28);
  ctx.font = '700 24px Inter, sans-serif';
  ctx.fillText(`Qua da hai: ${state.collected}/${TARGET_FRUITS}`, WORLD.width / 2, WORLD.height / 2 + 26);
  ctx.restore();
}

function isMatchableCell(cell) {
  return cell && !cell.matching && !cell.popping;
}

function findBasketMatch(grid) {
  const horizontalMatches = [];
  const verticalMatches = [];

  for (let row = 0; row < BASKET_ROWS; row += 1) {
    const base = row * BASKET_COLS;
    const a = grid[base];
    const b = grid[base + 1];
    const c = grid[base + 2];
    if (isMatchableCell(a) && isMatchableCell(b) && isMatchableCell(c) && a.type === b.type && b.type === c.type) {
      horizontalMatches.push([base, base + 1, base + 2]);
    }
  }

  for (let col = 0; col < BASKET_COLS; col += 1) {
    for (let row = 0; row <= BASKET_ROWS - 3; row += 1) {
      const i0 = row * BASKET_COLS + col;
      const i1 = i0 + BASKET_COLS;
      const i2 = i0 + BASKET_COLS * 2;
      const a = grid[i0];
      const b = grid[i1];
      const c = grid[i2];
      if (isMatchableCell(a) && isMatchableCell(b) && isMatchableCell(c) && a.type === b.type && b.type === c.type) {
        verticalMatches.push([i0, i1, i2]);
      }
    }
  }

  if (horizontalMatches.length === 0 && verticalMatches.length === 0) return null;

  const isCrossCombo = horizontalMatches.length > 0 && verticalMatches.length > 0;
  const matched = isCrossCombo
    ? [...horizontalMatches, ...verticalMatches].flat()
    : (horizontalMatches[0] ?? verticalMatches[0]);

  return {
    indexes: [...new Set(matched)],
    isCrossCombo,
  };
}

function App() {
  const [stats, setStats] = useState(summarizeState(makeInitialState()));
  const [lastFruit, setLastFruit] = useState(null);
  const [basketGrid, setBasketGrid] = useState(() => Array(BASKET_SIZE).fill(null));
  const [command, setCommand] = useState(null);
  const [powerWheel, setPowerWheel] = useState({ status: 'idle', result: null, id: 0 });
  const [resetKey, setResetKey] = useState(0);
  const canvasRef = useRef(null);
  const resolvingPowerRef = useRef(false);
  const powerTimersRef = useRef([]);
  const powerCooldownUntilRef = useRef(0);
  const audioRef = useRef({
    ready: false,
    background: null,
    effects: {},
    lastFruitHitAt: 0,
    fruitHitStreak: 0,
    lastManyHitAt: 0,
  });

  const handleStatsChange = useCallback((nextStats) => {
    setStats(nextStats);
  }, []);

  const ensureAudioStarted = useCallback(() => {
    if (typeof Audio === 'undefined') return;

    const audio = audioRef.current;
    if (!audio.ready) {
      audio.background = new Audio(SOUND_ASSETS.background);
      audio.background.loop = true;
      audio.background.volume = 0.32;
      audio.effects = {
        magnet: { src: SOUND_ASSETS.magnet, volume: 0.8 },
        prize: { src: SOUND_ASSETS.prize, volume: 0.78 },
        fruitCollision: { src: SOUND_ASSETS.fruitCollision, volume: 0.52 },
        manyFruitCollision: { src: SOUND_ASSETS.manyFruitCollision, volume: 0.74 },
      };
      audio.ready = true;
    }

    if (audio.background?.paused) {
      audio.background.play().catch(() => {});
    }
  }, []);

  const playSound = useCallback((name) => {
    ensureAudioStarted();

    const effect = audioRef.current.effects[name];
    if (!effect) return;

    const audio = new Audio(effect.src);
    audio.volume = effect.volume;
    audio.play().catch(() => {});
  }, [ensureAudioStarted]);

  const playFruitCollisionSound = useCallback(() => {
    const now = performance.now();
    const audio = audioRef.current;

    if (now - audio.lastFruitHitAt < 180) {
      audio.fruitHitStreak += 1;
    } else {
      audio.fruitHitStreak = 1;
    }
    audio.lastFruitHitAt = now;

    if (audio.fruitHitStreak >= 3 && now - audio.lastManyHitAt > 700) {
      audio.lastManyHitAt = now;
      audio.fruitHitStreak = 0;
      playSound('manyFruitCollision');
      return;
    }

    playSound('fruitCollision');
  }, [playSound]);

  const handleHarvest = useCallback((fruit, options = {}) => {
    playFruitCollisionSound();
    setLastFruit(fruit);
    if (options.addToBasket === false) {
      return;
    }

    setBasketGrid((grid) => {
      const newItem = {
        id: `${fruit.id}-${Date.now()}-${Math.random()}`,
        type: fruit.id,
        label: fruit.label,
        src: fruit.src,
        popping: false,
        matching: false,
      };

      const emptyIndexes = [];
      grid.forEach((cell, index) => {
        if (!cell) emptyIndexes.push(index);
      });

      if (emptyIndexes.length > 0) {
        const targetIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
        const nextGrid = grid.slice();
        nextGrid[targetIndex] = newItem;
        return nextGrid;
      }

      // Ro day: day o cu nhat ra, don sang de nhuong cho qua moi.
      return [...grid.slice(1), newItem];
    });
  }, [playFruitCollisionSound]);

  useEffect(() => {
    return () => {
      powerTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      powerTimersRef.current = [];
      audioRef.current.background?.pause();
    };
  }, []);

  useEffect(() => {
    const startAudio = () => ensureAudioStarted();
    window.addEventListener('pointerdown', startAudio, { once: true });
    window.addEventListener('keydown', startAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', startAudio);
      window.removeEventListener('keydown', startAudio);
    };
  }, [ensureAudioStarted]);

  useEffect(() => {
    if (resolvingPowerRef.current) return;

    const match = findBasketMatch(basketGrid);
    if (!match) return;

    resolvingPowerRef.current = true;
    const matchedSet = new Set(match.indexes);
    const spinId = Date.now();
    const isPowerCoolingDown = spinId < powerCooldownUntilRef.current && !match.isCrossCombo;

    setBasketGrid((grid) =>
      grid.map((cell, index) => (matchedSet.has(index) && cell ? { ...cell, matching: true } : cell)),
    );

    if (match.isCrossCombo) {
      canvasRef.current?.triggerNearestRowRain();
    }

    if (isPowerCoolingDown) {
      setPowerWheel({ status: 'cooldown', result: null, id: spinId });
      const clearTimer = window.setTimeout(() => {
        setBasketGrid((grid) => grid.map((cell, index) => (matchedSet.has(index) ? null : cell)));
        setPowerWheel({ status: 'idle', result: null, id: spinId });
        resolvingPowerRef.current = false;
      }, 520);
      powerTimersRef.current.push(clearTimer);
      return;
    }

    setPowerWheel({ status: 'spinning', result: null, id: spinId });
    playSound('prize');

    const spinTimer = window.setTimeout(() => {
      const power = POWER_TYPES[Math.floor(Math.random() * POWER_TYPES.length)];
      setPowerWheel({ status: 'result', result: power, id: spinId });
      powerCooldownUntilRef.current = Date.now() + POWER_COOLDOWN_MS;

      if (power.id === 'magnet') {
        playSound('magnet');
        canvasRef.current?.activateMagnet();
      } else {
        canvasRef.current?.triggerTimeStopRain();
      }

      const clearTimer = window.setTimeout(() => {
        setBasketGrid((grid) => grid.map((cell, index) => (matchedSet.has(index) ? null : cell)));
        setPowerWheel({ status: 'idle', result: null, id: spinId });
        resolvingPowerRef.current = false;
      }, POWER_RESULT_MS);
      powerTimersRef.current.push(clearTimer);
    }, POWER_SPIN_MS);

    powerTimersRef.current.push(spinTimer);
  }, [basketGrid, playSound]);

  const trigger = (name) => {
    ensureAudioStarted();
    setCommand({ name, id: Date.now() });
  };

  return (
    <main className="app-shell">
      <div className="orchard-layout">
        <section className="stage" aria-label="Vuon hai qua">
          <div className="hud">
            <div>
              <span className="hud-label">Qua</span>
              <strong>{stats.harvested}/{stats.target}</strong>
            </div>
            <div>
              <span className="hud-label">Pha</span>
              <strong>{stats.phase}</strong>
            </div>
            <div>
              <span className="hud-label">Gio</span>
              <strong>{Math.floor(stats.timeRemaining / 60)}:{String(stats.timeRemaining % 60).padStart(2, '0')}</strong>
            </div>
            <div>
              <span className="hud-label">Gan nhat</span>
              <strong>{lastFruit?.label ?? '-'}</strong>
            </div>
          </div>

          <OrchardCanvas
            ref={canvasRef}
            command={command}
            resetKey={resetKey}
            onHarvest={handleHarvest}
            onStatsChange={handleStatsChange}
          />

          <div className="actions">
            <button type="button" onClick={() => {
              ensureAudioStarted();
              powerTimersRef.current.forEach((timer) => window.clearTimeout(timer));
              powerTimersRef.current = [];
              resolvingPowerRef.current = false;
              powerCooldownUntilRef.current = 0;
              setPowerWheel({ status: 'idle', result: null, id: Date.now() });
              setBasketGrid(Array(BASKET_SIZE).fill(null));
              setResetKey((value) => value + 1);
            }}>Reset</button>
          </div>

          <div className="pad" aria-label="Dieu khien">
            <button type="button" className="pad-button up" onClick={() => trigger('up')} aria-label="Len">
              ^
            </button>
            <button type="button" className="pad-button left" onClick={() => trigger('left')} aria-label="Trai">
              &lt;
            </button>
            <button type="button" className="pad-button jump" onClick={() => trigger('jump')} aria-label="Nhay">
              J
            </button>
            <button type="button" className="pad-button shake" onClick={() => trigger('shake')} aria-label="Rung cay">
              Q
            </button>
            <button type="button" className="pad-button right" onClick={() => trigger('right')} aria-label="Phai">
              &gt;
            </button>
            <button type="button" className="pad-button down" onClick={() => trigger('down')} aria-label="Xuong">
              v
            </button>
          </div>
        </section>

        <aside className="basket" aria-label="Gio trai cay">
          <div className="basket-handle" aria-hidden="true" />
          <div className="basket-title">Gio qua</div>
          <div className="basket-rim" aria-hidden="true" />
          <div className={`power-wheel ${powerWheel.status !== 'idle' ? 'is-active' : ''} ${powerWheel.status === 'spinning' ? 'is-spinning' : ''}`}>
            <div className="power-wheel-pointer" aria-hidden="true" />
            <div className="power-wheel-disc" aria-hidden="true">
              <span>NC</span>
              <span>TG</span>
            </div>
            <div className="power-wheel-label">
              {powerWheel.status === 'spinning'
                ? 'Dang quay'
                : powerWheel.status === 'cooldown'
                  ? 'Hoi chieu'
                : powerWheel.result?.label ?? 'Match 3'}
            </div>
          </div>
          <div className="basket-grid">
            {basketGrid.map((item, index) => (
              <div
                key={item ? item.id : `slot-${index}`}
                className={`basket-item ${item ? '' : 'is-empty'} ${item?.matching ? 'is-matched' : ''} ${item?.popping ? 'is-popping' : ''}`}
              >
                {item && <img src={item.src} alt={item.label} />}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}

export default App;
