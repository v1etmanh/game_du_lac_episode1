# Bat Ga Prototype

## Coop and Clap Controls

- `Shift` + movement: sprint for 3 seconds, then wait for cooldown before sprinting again.
- `Space`: drop grain. Grain charges recover over time; the default recharge is 1 drop every 10 seconds.
- Grain dropped too close to the coop gate is ignored by chickens.
- `L`: open or close the coop gate.
- `K`: clap. A visible wave expands from the player; chickens touched by the wave enter `CLAP_PANIC` and run in a random direction.
- The coop has one gate on the left side. Chickens can pass through that gate only when it is open.
- A chicken is secured only after it is inside the coop and the gate is closed for the required hold time.
- Opening the gate after securing chickens can release them again, so the player should close the gate after herding chickens in.

Bat Ga Prototype là một prototype mô phỏng lùa gà chạy trên React + Vite. Người chơi điều khiển nhân vật trong sân, gây áp lực để đàn gà di chuyển, thả thóc để dụ gà, và đưa toàn bộ đàn vào chuồng.

## Tính năng chính

- Điều khiển người chơi bằng WASD hoặc phím mũi tên.
- Thả thóc bằng phím Space, giới hạn theo số lượt thả trong cấu hình.
- Gà có các trạng thái hành vi: `WANDER`, `PECK`, `ALERT`, `ESCAPE`, `PANIC`, `GO_TO_FOOD`, `EAT`, `SECURED`.
- Một gà trống có tốc độ chạy khác gà thường.
- Va chạm với biên sân và chướng ngại vật.
- Bảng điều chỉnh tham số mô phỏng theo thời gian thực.
- Bảng thống kê lượt chơi và trạng thái từng con gà.
- Debug overlay cho radius, hướng chạy, cone thoát và collision.

## Yêu cầu

- Node.js phiên bản hiện đại tương thích với Vite 7.
- npm.

## Cài đặt

```bash
npm install
```

## Chạy development

```bash
npm run dev
```

Vite sẽ chạy với host `127.0.0.1`. Mở URL được in ra trong terminal.

## Build

```bash
npm run build
```

Kết quả build nằm trong thư mục `dist/`.

## Preview bản build

```bash
npm run preview
```

## Cấu trúc thư mục

```text
.
├── src/
│   ├── components/      # React UI: canvas, panel điều khiển, stats, modal
│   ├── config/          # Default settings cho mô phỏng
│   ├── entities/        # Factory tạo player, chicken, coop, obstacle, grain
│   ├── math/            # Vector, random, geometry, collision helpers
│   └── simulation/      # Engine, world state, renderer và các system gameplay
├── index.html
├── package.json
└── vite.config.js
```

## Gameplay hiện tại

Mục tiêu là đưa toàn bộ gà vào chuồng. Gà phản ứng theo khoảng cách với người chơi:

- Ngoài vùng cảnh giác: gà đi lang thang hoặc mổ đất.
- Trong `alertRadius`: gà lập tức bứt tốc mạnh để thoát khỏi vùng ảnh hưởng.
- Càng gần người chơi, gà càng được cộng thêm tốc độ trên nền bứt tốc đó.
- Trong `panicRadius`: gà bứt tốc mạnh hơn nữa và tăng thống kê panic.
- Nếu có thóc đủ gần và người chơi không đứng quá sát bãi thóc, gà sẽ đi ăn.
- Khi đứng trong chuồng đủ `coopRequiredStayTime`, gà được tính là secured.

## Tài liệu liên quan

- [ARCHITECTURE.md](ARCHITECTURE.md): giải thích kiến trúc và luồng update.
- [FOLLOW.md](FOLLOW.md): quy trình follow khi phát triển thêm gameplay.
- [AGENTS.md](AGENTS.md): hướng dẫn cho coding agent làm việc trong repo.


di chuyen banăbawnawcon chuot
