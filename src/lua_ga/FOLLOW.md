# Follow Guide

## New Tuning Notes

- Coop gate: tune `coopGateWidth` and `coopWallThickness`.
- Clap wave: tune `clapWaveSpeed`, `clapWaveRadius`, `clapPanicSpeed`, and `clapRunDistance`.
- When testing coop behavior, verify closed gate blocks every wall, open gate permits only the left gate, and secured chickens can be released if the gate is opened.

Tài liệu này là checklist follow khi tiếp tục phát triển Bat Ga Prototype.

## Khi bắt đầu một task

1. Chạy `git status --short` để xem worktree hiện tại.
2. Đọc file liên quan trong `src/simulation`, `src/entities`, `src/components` trước khi sửa.
3. Xác định task thuộc nhóm nào:
   - Gameplay/system logic.
   - UI/settings panel.
   - Rendering/debug overlay.
   - Math/collision helper.
   - Documentation/build tooling.
4. Giữ thay đổi nhỏ và đúng phạm vi task.

## Quy trình phát triển khuyến nghị

1. Cập nhật cấu hình trong `src/config/defaultSettings.js` nếu cần thêm tham số.
2. Thêm hoặc sửa entity factory trong `src/entities` nếu cần state mới.
3. Đưa logic gameplay vào system tương ứng trong `src/simulation`.
4. Chỉ cập nhật React UI khi người chơi cần nhìn thấy hoặc điều chỉnh dữ liệu đó.
5. Nếu gameplay thay đổi luồng state, cập nhật `ARCHITECTURE.md`.
6. Chạy `npm run build` trước khi bàn giao.

## Checklist trước khi hoàn thành

- App build thành công bằng `npm run build`.
- Không commit `node_modules/` hoặc `dist/`.
- Settings mới có default rõ ràng.
- Không để logic gameplay quan trọng trong JSX.
- Snapshot không gửi dữ liệu thừa gây render nhiều.
- UI không làm gián đoạn vòng lặp canvas.
- Debug overlay vẫn có thể bật/tắt độc lập.

## Gameplay tuning

Khi chỉnh cảm giác lùa gà, ưu tiên thay đổi theo thứ tự:

1. Radius: `chickenAlertRadius`, `chickenPressureRadius`, `chickenPanicRadius`.
2. Tốc độ: `chickenWanderSpeed`, `chickenEscapeSpeed`, `chickenPanicSpeed`.
3. Escape behavior: `escapeConeAngle`, `minimumEscapeDistance`, `maximumEscapeDistance`.
4. Burst escape: `chickenEscapeBurstMultiplier`, `chickenPanicBurstMultiplier`, `escapeExitBuffer`.
5. Thóc: `grainAttractionRadius`, `grainPlayerExclusionRadius`, `grainLifetime`.
6. Chuồng: `coopRequiredStayTime`.

Sau mỗi thay đổi lớn, thử ít nhất 2 lượt:

- Một lượt dùng pressure trực tiếp.
- Một lượt dùng thóc để dụ gà.

## Quy ước commit

Gợi ý format commit:

```text
feat: add coop scoring feedback
fix: prevent chickens from clipping through hay
docs: document simulation architecture
tune: adjust panic radius defaults
```

## Ghi chú follow-up

- Thêm test tự động cho math/collision helper nếu logic phức tạp hơn.
- Tách tuning presets nếu bắt đầu có nhiều profile difficulty.
- Cân nhắc lưu replay/snapshot nếu cần so sánh hiệu quả thuật toán.
- Thêm mobile/touch controls nếu prototype hướng tới thiết bị cảm ứng.
