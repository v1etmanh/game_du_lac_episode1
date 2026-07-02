# Development Workflow

## Khoi dong

```bash
npm install
npm run dev
```

Vite se in URL local trong terminal. Neu port mac dinh dang ban, Vite se tu chon port khac.

## Vong lap lam viec

1. Sua gameplay data trong `src/gameData.js` neu can doi note, timing, hit window, hoac gesture.
2. Sua logic engine trong `src/useGameEngine.js` neu can doi scoring, timing, input, hay trang thai.
3. Sua visual trong `src/NoteTrack.js`, `src/JoystickCircle.js`, hoac `src/App.jsx`.
4. Sua timbre/pitch bend trong `src/audioEngine.js`.
5. Chay `npm run lint`.
6. Chay `npm run build` truoc khi giao ban build.

## Quy uoc thay doi

- Giu gameplay constants tap trung trong `src/gameData.js`.
- Khong dua logic realtime vao React state neu no can cap nhat moi frame; dung ref trong engine.
- Chi dua snapshot toi React/canvas draw loop qua `onStateChange`.
- Khi them gesture moi, cap nhat ca `GESTURE`, `getTargetLever`, `drawGesturePath`, va mau/ky hieu note.
- Khi them key moi, cap nhat `PLAY_KEYS`, `KEY_MAP`, va huong dan trong UI/README.

## Kiem thu thu cong

- Start game, dam bao countdown chay.
- Bam dung note dau tien bang `A`; can co am thanh va feedback hit.
- Test note len/xuong bang cach keo joystick theo chi dan.
- Tha chuot; joystick phai spring ve tam.
- Het bai; overlay phai hien so note dung va missed.

## Build

```bash
npm run build
npm run preview
```

Output production nam trong `dist/` va da duoc ignore boi git.
