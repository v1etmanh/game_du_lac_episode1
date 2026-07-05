export function createPlayer(settings) {
  return {
    x: 150,
    y: 320,
    radius: 12,
    speed: settings.playerSpeed,
    velocityX: 0,
    velocityY: 0,
    directionX: 0,
    directionY: 1,
    sprintActiveTime: 0,
    sprintCooldownRemaining: 0,
    dashCooldownRemaining: 0,
    dashEffectRemaining: 0,
    dashEffectDuration: settings.playerDashEffectDuration,
    dashStartX: 150,
    dashStartY: 320,
    dashEndX: 150,
    dashEndY: 320
  };
}
