# Project Overview

## Muc tieu

Dan Bau Demo la mot prototype rhythm game nho tap trung vao cam giac choi dan bau: bam note dung thoi diem va dieu khien can dan de bien doi cao do. Du an hien la frontend-only, khong co backend, database, hay asset am thanh ngoai.

## Cong nghe

- React 19 cho shell UI va state render.
- Vite 8 cho dev server va build.
- Canvas 2D cho toan bo gameplay visual.
- Web Audio API cho tong hop am thanh runtime.
- ESLint 10 voi rule React Hooks va React Refresh.

## Gameplay Loop

1. Nguoi choi bam nut bat dau.
2. Engine reset bai demo va bat countdown.
3. Moi frame cap nhat `songTime`, note missed, input joystick va gesture.
4. Khi nguoi choi bam dung key trong hit window, note duoc danh dau hit va bat dau phat am.
5. Trong thoi gian gesture, joystick duoc so voi duong muc tieu va bend cao do theo truc Y.
6. Khi het bai, overlay hien ket qua hit/miss va cho choi lai.

## Input

- Keyboard: `A W E D X Z`.
- Mouse/touch: keo trong vong joystick ben phai canvas.
- AudioContext chi resume sau user gesture de phu hop chinh sach autoplay cua trinh duyet.

## Gioi han hien tai

- Bai hat demo duoc hard-code trong `src/gameData.js`.
- Chua co test tu dong.
- Chua co responsive layout rieng cho man hinh rat nho; canvas chi scale theo kich thuoc viewport.
- Tat ca am thanh duoc tong hop bang oscillator, chua dung sample dan bau that.
