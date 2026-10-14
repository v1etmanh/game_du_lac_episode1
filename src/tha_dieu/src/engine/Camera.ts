import { Vector2 } from "./math/Vector2";

export class Camera {
  readonly position = new Vector2();

  update(target: Vector2, facingDirection: number, viewportWidth: number, viewportHeight: number, deltaSeconds: number): void {
    const lookAhead = 150 * facingDirection;
    const desiredX = target.x + lookAhead - viewportWidth * 0.36;

    // Đặt mặt đất ở gần đáy màn hình (~120-140px từ cạnh đáy), nhường phần lớn không gian phía trên cho bầu trời và diều bay
    const groundBaselineY = 430;
    const groundMargin = Math.min(140, Math.max(90, viewportHeight * 0.16));
    const baseCameraY = groundBaselineY - (viewportHeight - groundMargin);

    // Khi nhân vật nhảy cao, camera êm ái nhấc lên nhẹ theo nhân vật
    const playerStandY = groundBaselineY - 58;
    const jumpOffset = Math.max(0, playerStandY - target.y);
    const desiredY = baseCameraY - jumpOffset * 0.45;

    const smoothing = 1 - Math.exp(-deltaSeconds * 4.5);
    this.position.x += (desiredX - this.position.x) * smoothing;
    this.position.y += (desiredY - this.position.y) * smoothing;

    // Giữ camera không bao giờ thấp hơn mức mặt đất chuẩn để mặt đất không bị đẩy lên giữa màn hình
    this.position.y = Math.min(baseCameraY, Math.max(-1200, this.position.y));
  }
}
