# Architecture

## So do module

```text
index.html
  -> src/main.jsx
      -> src/App.jsx
          -> useGameEngine(onStateChange)
          -> drawNoteTrack(...)
          -> drawJoystick(...)
          -> drawHUD(...)

src/useGameEngine.js
  -> src/gameData.js
  -> src/audioEngine.js

src/NoteTrack.js
  -> src/gameData.js

src/JoystickCircle.js
  -> src/gameData.js
```

## Runtime Model

`App.jsx` la lop ket noi UI. Component gan keyboard, mouse va touch listener, giu canvas refs, va render overlay start/end. Canvas khong duoc chia thanh React component rieng; moi thu trong gameplay duoc ve truc tiep bang Canvas 2D.

`useGameEngine.js` la realtime core. Module nay dung `useRef` de luu mutable state vi game loop chay moi animation frame. Moi tick cap nhat thoi gian, missed notes, joystick spring, gesture validation, hit-result fade va song end.

`onStateChange` day snapshot sang `App.jsx`. Snapshot nay kich hoat draw effect de ve lai canvas chinh va canvas dem cua note track.

## Canvas Layers

- Main canvas: background, note track da blit, joystick, divider, HUD.
- Hidden track canvas: render lane va note track truoc, sau do copy vao main canvas tai toa do `x=50`.

## Audio

`audioEngine.js` tao AudioContext lazy khi co user gesture. Moi note dung tao 3 oscillator sine:

- 2 oscillator gan tan so goc de tao cam giac string am hon.
- 1 oscillator harmonic bac 2.
- Gain envelope tao attack ngan va decay dai.
- High-pass filter cat bot low mud.

Pitch bend duoc dieu khien bang `setBend(amount)` va map theo truc Y cua joystick trong khoang gan mot semitone.

## Data Model

Mot note trong `DEMO_SONG` co dang:

```js
{
  id: 0,
  time: 2.0,
  key: 'a',
  gesture: GESTURE.HOLD,
  duration: 0.8
}
```

Khi game start, note duoc clone va them runtime flags `hit` va `missed`.

## Ranh gioi trach nhiem

- `gameData.js`: cau hinh va noi dung bai.
- `useGameEngine.js`: logic thoi gian, scoring, input, gesture, audio trigger.
- `audioEngine.js`: am thanh va bend.
- `NoteTrack.js`: visual note lane.
- `JoystickCircle.js`: visual can dan.
- `App.jsx`: orchestration, layout canvas, overlays, HUD.
