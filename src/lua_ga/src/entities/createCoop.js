export function createCoop(settings) {
  return {
    x: 790,
    y: 245,
    width: 160,
    height: 130,
    requiredStayTime: settings.coopRequiredStayTime,
    closed: true,
    gateSide: "left",
    gateWidth: settings.coopGateWidth,
    wallThickness: settings.coopWallThickness
  };
}
