# Architecture

## Coop Gate and Clap Wave

- Player sprint lives on the player entity as `sprintActiveTime` and `sprintCooldownRemaining`. `Shift` while moving starts a timed sprint when cooldown is ready.
- `CoopSystem` owns coop gate geometry, wall collision rectangles, secured timing, and release behavior when the gate is opened.
- The coop has one left-side gate. `resolveCoopWallCollisions` blocks player and chickens against every wall segment; the gate segment exists only when the coop is closed.
- `L` toggles `world.coop.closed`.
- `ClapSystem` owns clap wave creation and expansion. `K` creates a wave at the player position.
- Each wave tracks the chicken ids it already touched so one wave cannot repeatedly panic the same chicken.
- A touched chicken enters `CLAP_PANIC`, receives a random direction, and runs for `clapRunDistance` or until its direction lock expires.

Tài liệu này mô tả cấu trúc kỹ thuật của Bat Ga Prototype.

## Tổng quan

Dự án là một ứng dụng React render UI, còn gameplay simulation chạy trên canvas thông qua một engine tự quản lý vòng lặp `requestAnimationFrame`.

Luồng chính:

```text
React App
  -> SimulationCanvas
    -> SimulationEngine
      -> InputManager
      -> update systems
      -> Renderer
      -> snapshotWorld
  -> ControlPanel / StatisticsPanel / CompletionModal
```

React chịu trách nhiệm hiển thị panel, nhận thay đổi settings, và giữ snapshot mới nhất. Canvas chịu trách nhiệm vẽ trạng thái thế giới sau mỗi frame.

## Entry points

- `src/main.jsx`: mount React app.
- `src/App.jsx`: giữ `settings`, `snapshot`, và ref điều khiển simulation.
- `src/components/SimulationCanvas.jsx`: tạo `SimulationEngine`, expose `reset`, `pause`, `resume`.
- `src/simulation/SimulationEngine.js`: vòng lặp update/render chính.

## World state

`src/simulation/World.js` tạo object world gồm:

- `player`: nhân vật người chơi.
- `chickens`: đàn gà, hiện có 5 gà thường và 1 gà trống.
- `grainPiles`: các bãi thóc được thả trong lượt chơi.
- `obstacles`: đá/rơm trong sân.
- `coop`: vùng chuồng.
- `stats`: thống kê thời gian, quãng đường, panic, va chạm, số lần gà rời chuồng.
- `completed`, `paused`, `grainSequence`: trạng thái vòng đời lượt chơi.

`snapshotWorld` chuyển world nội bộ thành dữ liệu nhẹ để React UI render.

## Update loop

`SimulationEngine.loop(now)` chạy mỗi animation frame:

1. Tính `deltaTime`, giới hạn tối đa 0.05 giây để tránh frame spike.
2. Đọc input pause.
3. Nếu world không pause/completed, gọi `update(deltaTime)`.
4. Render canvas.
5. Emit snapshot định kỳ khoảng 0.12 giây/lần.

`SimulationEngine.update(deltaTime)` xử lý theo thứ tự:

1. Tăng elapsed time.
2. Nếu Space được nhấn, gọi `dropGrain`.
3. Cập nhật player movement.
4. Cập nhật grain lifetime/amount.
5. Cập nhật hành vi và chuyển động của gà.
6. Tách gà khỏi nhau và giữ gà trong world bounds.
7. Cập nhật coop/completion.

Thứ tự này quan trọng vì gà cần nhìn thấy vị trí mới của player và trạng thái thóc mới nhất trước khi quyết định hành vi.

## Systems

### `InputManager`

Quản lý keyboard events cho:

- Di chuyển: WASD hoặc arrow keys.
- Drop grain: Space.
- Pause: P.

Các input dạng action dùng consume method để tránh bị xử lý nhiều lần trong cùng một lần nhấn.

### `ChickenSystem`

Đây là nơi quyết định state machine của gà:

- `WANDER` / `PECK`: hành vi nền khi không có áp lực.
- `ALERT`: trạng thái lịch sử, hiện không còn là phản ứng chính khi player áp sát.
- `ESCAPE`: player vào vùng ảnh hưởng, gà lập tức bứt tốc để thoát khỏi `alertRadius`.
- `PANIC`: player vào vùng panic, gà bứt tốc mạnh hơn.
- `GO_TO_FOOD` / `EAT`: gà bị thóc hấp dẫn nếu thóc còn active và player không đứng quá sát.
- `SECURED`: gà đã vào chuồng.

Escape direction được chọn theo cone ngược hướng player, có lock time và quãng chạy tối thiểu/tối đa để chuyển động ít giật hơn. Khi player chạm vùng ảnh hưởng, gà đã có tốc độ bứt phá tối thiểu rất cao; độ gần của player chỉ cộng thêm boost lên nền tốc độ đó.

### `GrainSystem`

Quản lý:

- Tạo bãi thóc tại vị trí player.
- Giới hạn số lượt thả.
- Tuổi thọ bãi thóc.
- Lượng thóc còn lại.
- Tốc độ gà ăn thóc.

### `CollisionSystem`

Giữ entity trong bounds, xử lý va chạm với obstacle, và tách gà khỏi nhau để tránh overlap.

### `CoopSystem`

Theo dõi gà nằm trong vùng chuồng. Gà cần ở trong chuồng đủ `coopRequiredStayTime` để được secured. Khi toàn bộ đàn secured, world được đánh dấu completed.

### `Renderer`

Vẽ toàn bộ world lên canvas:

- Sân chơi.
- Player.
- Gà.
- Thóc.
- Obstacle.
- Chuồng.
- Debug overlay tùy settings.

Renderer nhận settings để bật/tắt các lớp debug mà không cần React render lại canvas trực tiếp.

## Configuration

`src/config/defaultSettings.js` là nguồn cấu hình mặc định cho:

- Kích thước world.
- Tốc độ player và gà.
- Radius cảnh giác/áp lực/panic.
- Tham số escape cone.
- Tham số thóc.
- Điều kiện secured trong chuồng.
- Debug overlay.

Khi thêm tham số mới, cần cập nhật:

1. `DEFAULT_SETTINGS`.
2. UI trong `ControlPanel` nếu muốn chỉnh live.
3. System sử dụng tham số.
4. README hoặc tài liệu nếu tham số ảnh hưởng gameplay.

## Quy ước mở rộng

- Entity factory nằm trong `src/entities`.
- Logic update theo domain nằm trong `src/simulation/*System.js`.
- Math helper thuần nằm trong `src/math`.
- React component không nên chứa gameplay rules phức tạp.
- Snapshot gửi sang React nên nhỏ gọn, chỉ gồm dữ liệu UI cần hiển thị.
