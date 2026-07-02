# Agent Guide

Hướng dẫn cho coding agent làm việc trong repo Bat Ga Prototype.

## Ngôn ngữ và stack

- App dùng React + Vite, JavaScript ES modules.
- Gameplay chạy trong canvas, không dùng engine game ngoài.
- Không thêm framework hoặc dependency mới nếu task không thực sự cần.

## Lệnh thường dùng

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Quy tắc làm việc

- Luôn kiểm tra `git status --short` trước khi sửa.
- Không revert thay đổi của người dùng.
- Không commit `node_modules/` hoặc `dist/`.
- Ưu tiên đọc code hiện có rồi mới sửa.
- Giữ thay đổi đúng phạm vi yêu cầu.
- Sau khi sửa code runtime, chạy `npm run build` nếu có thể.

## Vị trí code quan trọng

- `src/App.jsx`: wiring giữa UI và simulation.
- `src/components/SimulationCanvas.jsx`: bridge React -> canvas engine.
- `src/components/ControlPanel.jsx`: UI chỉnh settings.
- `src/components/StatisticsPanel.jsx`: UI hiển thị snapshot.
- `src/config/defaultSettings.js`: default tuning.
- `src/simulation/SimulationEngine.js`: game loop.
- `src/simulation/World.js`: tạo world và snapshot.
- `src/simulation/ChickenSystem.js`: state machine của gà.
- `src/simulation/GrainSystem.js`: logic thóc.
- `src/simulation/CoopSystem.js`: điều kiện secured/completion.
- `src/simulation/CollisionSystem.js`: bounds/obstacle/separation.
- `src/simulation/Renderer.js`: canvas drawing.
- `src/entities/*`: factory tạo entity.
- `src/math/*`: helper thuần.

## Ranh giới trách nhiệm

- React components chỉ nên giữ UI state, settings, và snapshot.
- Simulation systems giữ gameplay rules.
- Renderer chỉ vẽ theo world/settings, không quyết định gameplay.
- Math helper nên thuần, dễ test, không phụ thuộc DOM hoặc React.
- Entity factory nên tạo shape dữ liệu nhất quán và default local cho entity đó.

## Khi thêm behavior mới cho gà

1. Thêm field cần thiết trong `createChicken`.
2. Thêm hoặc sửa transition trong `ChickenSystem`.
3. Đảm bảo state mới được render ổn trong `StatisticsPanel`.
4. Nếu cần debug visual, thêm vẽ trong `Renderer` sau khi có setting bật/tắt.
5. Cập nhật `ARCHITECTURE.md` nếu state ảnh hưởng state machine.

## Khi thêm setting mới

1. Thêm vào `DEFAULT_SETTINGS`.
2. Thêm control phù hợp trong `ControlPanel` nếu cần chỉnh live.
3. Đọc setting từ system hoặc renderer liên quan.
4. Reset vẫn phải giữ setting mới.
5. Không hard-code cùng một giá trị ở nhiều nơi.

## Khi chỉnh collision/math

- Ưu tiên helper thuần trong `src/math`.
- Giữ tên hàm mô tả đúng hình học đang xử lý.
- Cẩn thận với zero-length vector.
- Sau khi sửa collision, thử player, chicken, obstacle và world bounds.

## Khi chỉnh docs

- README tập trung vào cách chạy và mô tả sản phẩm.
- ARCHITECTURE tập trung vào luồng kỹ thuật.
- FOLLOW tập trung vào checklist phát triển.
- AGENTS tập trung vào hướng dẫn cho agent/cộng tác viên kỹ thuật.
