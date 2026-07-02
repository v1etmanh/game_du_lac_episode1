export const GAME_ASSETS = {
  chickens: {
    frameWidth: 48,
    frameHeight: 48,
    framesPerRow: 4,
    rows: {
      walk_down: 0,
      walk_left: 1,
      walk_right: 2,
      walk_up: 3,
      fly_down: 4,
      fly_left: 5,
      fly_right: 6,
      fly_up: 7
    },
    sheets: {
      hen: "/assets/game/hen-sheet.svg",
      rooster: "/assets/game/rooster-sheet.svg"
    }
  },
  player: {
    frameWidth: 48,
    frameHeight: 48,
    framesPerRow: 4,
    idleDirections: ["down", "up", "left", "right"],
    animations: {
      idle: "/assets/game/lan_anh_idle.svg",
      walk_down: "/assets/game/lan_anh_walk_down.svg",
      walk_left: "/assets/game/lan_anh_walk_left.svg",
      walk_right: "/assets/game/lan_anh_walk_right.svg",
      walk_up: "/assets/game/lan_anh_walk_up.svg",
      run_down: "/assets/game/lan_anh_run_down.svg",
      run_left: "/assets/game/lan_anh_run_left.svg",
      run_right: "/assets/game/lan_anh_run_right.svg",
      run_up: "/assets/game/lan_anh_run_up.svg"
    }
  },
  environment: {
    background: "/assets/game/background-field.svg",
    coopOpen: "/assets/game/coop-open.svg",
    coopClosed: "/assets/game/coop-closed.svg",
    strawPile: "/assets/game/straw-pile.svg",
    fenceSegment: "/assets/game/fence-segment.svg",
    bananaTree: "/assets/game/banana-tree.svg"
  }
};
