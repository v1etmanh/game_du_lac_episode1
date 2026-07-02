# Agent Instructions

## Pham vi

File nay huong dan agent hoac contributor lam viec trong repo Dan Bau Demo. Uu tien giu thay doi gon, dung kien truc hien co va khong refactor ngoai pham vi yeu cau.

## Lenh nen chay

```bash
npm run lint
npm run build
```

Neu chi sua markdown, khong bat buoc build, nhung nen dam bao link va ten file dung.

## Quy tac code

- Giu source la JavaScript/JSX ES modules.
- Khong them framework moi neu React + Vite + Canvas 2D da du.
- Gameplay constants dat trong `src/gameData.js`.
- Realtime mutable state nen o `useRef`, khong day vao React state moi frame.
- Bat ky thay doi nao den gesture phai dong bo giua engine va renderer.
- Bat ky thay doi nao den audio phai ton trong autoplay policy: audio chi start/resume sau user input.

## Noi can doc truoc khi sua

- Sua game feel/scoring: doc `src/useGameEngine.js` va `src/gameData.js`.
- Sua visual note track: doc `src/NoteTrack.js`.
- Sua joystick: doc `src/JoystickCircle.js`.
- Sua layout/overlay: doc `src/App.jsx`.
- Sua am thanh: doc `src/audioEngine.js`.

## Can trong

- Repo hien co `node_modules/` trong workspace, nhung khong commit thu muc nay.
- Thu muc `dist/` la build output va khong commit.
- Khong xoa `package-lock.json`; dung npm lam package manager mac dinh.
- Chua co test tu dong, nen thay doi gameplay can duoc test thu cong trong browser.
