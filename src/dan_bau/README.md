# Dan Bau Demo

Prototype game am nhac cho dan bau, xay bang React, Vite, Canvas 2D va Web Audio API. Nguoi choi bam phim khi note truot xuong mot day dan duy nhat, sau do dieu khien can dan bang chuot hoac cam ung de tao gesture nhan, ha, hoac giu cao do.

## Tinh nang hien co

- Man hinh canvas 900 x 600 voi note track ben trai va joystick can dan ben phai.
- 6 phim tuong ung thang am demo C D E G A C5: `A W E D X Z`.
- Chuoi demo 8 note trong `src/gameData.js`, ket thuc o moc 16 giay.
- Cham diem theo cua so `PERFECT` va `GOOD`.
- Pitch bend truc tiep bang Web Audio khi nguoi choi keo can dan.
- Ho tro chuot va touch cho joystick.

## Yeu cau

- Node.js phien ban hien dai co ho tro Vite.
- npm.

## Cai dat

```bash
npm install
```

## Chay local

```bash
npm run dev
```

Sau do mo URL Vite hien trong terminal, thuong la `http://localhost:5173`.

## Lenh du an

```bash
npm run dev      # chay dev server
npm run build    # build production vao dist/
npm run preview  # preview ban build
npm run lint     # chay ESLint
```

## Cach choi

- Bam `A W E D X Z` khi note cham vach danh.
- Keo joystick len khi note co mui ten len.
- Keo joystick xuong khi note co mui ten xuong.
- Giu joystick o tam khi note co dau cham.

## Cau truc nhanh

- `src/App.jsx`: UI canvas, overlay start/end, draw loop va input binding.
- `src/useGameEngine.js`: game loop, timing, hit detection, gesture validation.
- `src/gameData.js`: map phim, tan so note, hang so gameplay va bai demo.
- `src/audioEngine.js`: Web Audio oscillator chain va pitch bend.
- `src/NoteTrack.js`: ve than dan bau, mot day, note, hit line, label phim va feedback.
- `src/JoystickCircle.js`: ve joystick can dan va duong guide gesture.
- `src/index.css`: reset va bien mau nen.

Xem them `OVERVIEW.md`, `WORKFLOW.md`, `ARCHITECTURE.md`, va `AGENTS.md` de nam ro cach tiep tuc phat trien.
