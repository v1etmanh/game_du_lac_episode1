# Đàn Bầu Online — Game Specification v1.0

> **Status:** Ready to build  
> **Last updated:** 2026-06-18  
> **Stack:** React 18 + Vite · Canvas 2D · Web Audio API · Vercel

---

## 1. Tổng quan

Web game mô phỏng chơi đàn bầu trực tuyến, nhắm đến **gamers và người tò mò về văn hóa dân gian Việt Nam**. Mục tiêu: người dùng vào web trong vòng 30 giây đã có thể chơi được, cảm nhận được âm thanh và văn hóa đàn bầu.

**Bài nhạc duy nhất:** Bèo Dạt Mây Trôi (~42 nốt, ~52 giây, BPM 72)  
**Rewrite hoàn toàn** — không kế thừa gì từ codebase cũ ngoài React + Vite scaffold.

---

## 2. Luồng màn hình

```
Start Screen → Tutorial (4 bước) → Game Screen → Result Screen
                                                       ↓
                                                    Chơi lại → Game Screen
```

Người dùng có thể bỏ qua Tutorial từ Bước 4 trở đi bằng nút **"Bỏ qua"**.  
Từ lần thứ 2 trở đi, Start Screen có nút **"Chơi ngay"** (skip tutorial).

---

## 3. Visual System

### 3.1 Painting Asset (quan trọng nhất)

Asset chính: `public/bg-painting.webp` — bức tranh sơn dầu đàn bầu trong căn phòng cổ Việt Nam.

| Màn hình | Cách dùng painting |
|---|---|
| Start Screen | `background-size: cover`, opacity 100%, không filter |
| Tutorial | Mờ dần: `brightness(0.4) blur(2px)`, overlay tối 50% |
| Game Screen | `brightness(0.35)`, overlay tối 60% — painting làm nền mờ |
| Result Screen | `brightness(0.4) blur(3px)`, overlay tối 55% |

> **Lý do:** Trong tranh, đàn bầu nằm ở góc phối cảnh 3D → không thể map gameplay node lên dây trong tranh. Giải pháp: Start screen dùng painting thuần túy (đẹp, immersive). Khi bấm "Bắt Đầu" → transition fade → Game Screen giữ painting làm background mờ + thêm lớp **đàn flat interactive** overlay lên trên (canvas element riêng, absolute positioned).

### 3.2 Color Palette (trích từ tranh)

```js
const COLORS = {
  bgDeep:      '#0d0804',  // nền tối mahogany
  woodDark:    '#2a1208',  // gỗ hồng mộc
  woodBody:    '#5c2d0e',  // thân đàn
  woodSurface: '#c4953a',  // mặt đàn (lighter)
  goldString:  '#f0d060',  // dây đàn / accent chính
  goldDim:     '#c4953a',  // accent phụ / border
  paperOld:    '#d4bc80',  // text phụ / aged paper
  ceramicBlue: '#4a6ea0',  // accent xanh gốm (UI info)
  textPrimary: '#f0d060',  // text chính
  textSecond:  '#d4bc80',  // text phụ
  textMuted:   '#8a7050',  // text mờ
}
```

### 3.3 Typography

- **Font duy nhất:** `Georgia, serif` — không dùng sans-serif ở bất kỳ đâu
- HUD/title: `letter-spacing: 4–6px`, uppercase
- Body/info: `letter-spacing: 1–2px`, normal case
- Font size: title 16–18px, HUD 12–14px, body 10–11px

### 3.4 Frame Viền Cũ (Distressed Border)

Áp lên `<div>` wrapper ngoài cùng, CSS box-shadow nhiều lớp:

```css
.game-frame {
  box-shadow:
    inset 0 0 0 3px #c4953a44,
    inset 0 0 0 6px #2a120888,
    inset 0 0 40px rgba(0,0,0,0.6),
    inset 0 0 80px rgba(13,8,4,0.4);
  /* Grain texture overlay bằng pseudo-element */
}
.game-frame::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* noise SVG pattern */
  opacity: 0.06;
  pointer-events: none;
}
```

### 3.5 Trang trí bên khung

- **Chữ Hán hai bên:** `梁祝` (trái), `音樂` (phải) — `font-size: 28px`, `opacity: 0.12`, xoay nhẹ
- **Thơ dọc:** "Tiếng đàn bầu" (trái), "hồn dân tộc" (phải) — `writing-mode: vertical-rl`, `opacity: 0.25`

---

## 4. Màn hình chi tiết

### 4.1 Start Screen

**Layout:**
```
┌─────────────────────────────────────────────┐
│  [Frame viền cũ]                            │
│  ── HUD bar mờ ──────────────────────────── │
│  0/42          ĐÀN BẦU        STREAK  00:45 │
│  ─────────────────────────────────────────  │
│                                             │
│   [PAINTING FULLSCREEN — 100% opacity]      │
│                                             │
│  "Tiếng đàn bầu của ta                     │
│   Cung đàn dân tộc · Lời ca đất nước"       │
│             — Nguyễn Đình Thi               │
│                                             │
│                        ┌──────────────────┐ │
│                        │  BEST SCORE      │ │
│                        │     1,450        │ │
│                        │  [Bắt Đầu →]    │ │
│                        │  [Hướng Dẫn]    │ │
│                        └──────────────────┘ │
└─────────────────────────────────────────────┘
```

**Elements:**
- Background: painting 100%, `object-fit: cover`
- HUD top bar: `background: rgba(10,5,2,0.75)`, `backdrop-filter: blur(4px)`, height 44px
- Quote ở giữa: `position: absolute`, centered, Georgia italic, `color: rgba(212,188,128,0.4)`, 3 dòng
- Score panel: bottom-right, `background: rgba(10,5,2,0.85)`, border `1px solid #c4953a44`, border-radius 6px
- Nút "Bắt Đầu": gradient `linear-gradient(#c4953a, #8b5a18)`, border `1px solid #f0d060`, text vàng
- Nút "Hướng Dẫn": transparent, `border: 1px solid #c4953a66`, text mờ

**Subtitle dưới title:**  
`"Nhạc cụ một dây · 700 năm lịch sử Việt Nam"`

---

### 4.2 Tutorial Screen (4 bước)

Painting mờ (`brightness: 0.4`), overlay tối. Nội dung tutorial hiện ở giữa màn hình.

#### Bước 1 — Giới thiệu (5 giây, auto-advance hoặc nhấn tiếp)

```
┌──────────────────────────────────────┐
│            ĐÀN BẦU                   │
│                                      │
│  [Icon đàn bầu nhỏ]                  │
│                                      │
│  Nhạc cụ một dây độc đáo của         │
│  Việt Nam. Tiếng đàn tạo ra từ       │
│  hài âm tự nhiên — không phím,       │
│  không ngăn, chỉ một dây.            │
│                                      │
│              [Tiếp theo →]           │
└──────────────────────────────────────┘
```

#### Bước 2 — Gảy thử (**bắt buộc tương tác**)

Hiện đàn flat (nhỏ, giống game screen), Node C sáng nhấp nháy.

```
  "Nhấn phím  [A]  để gảy dây đàn"

  [Đàn flat nhỏ — node C nhấp nháy với mũi tên]

  ✦ Nghe thấy chưa? Tiếng ngân là linh hồn đàn bầu.
```

→ **Phải nhấn A** thì mới unlock bước tiếp. Khi nhấn: âm thanh + ripple + flash "TUYỆT!".

#### Bước 3 — Uốn tiếng (**bắt buộc tương tác**)

Đàn flat hiện cần đàn bên phải.

```
  "Giữ chuột trái và kéo lên hoặc xuống"
  "để uốn độ cao tiếng đàn"

  [Cần đàn animate — mũi tên ↑↓]
  [Thanh pitch indicator bên cạnh]
```

→ **Phải giữ chuột + kéo** >0.3 semitone thì mới unlock. Khi thành công: âm thanh bend + "Cảm nhận được chưa?".

#### Bước 4 — Thực hành (có thể bỏ qua)

3 nốt chạy chậm (speed 50%) với mũi tên timing guide:

```
  "Gảy đúng lúc nốt đến điểm ○"

  [Đàn full-width, 3 nốt chạy chậm]
  [Mũi tên "→ Nhấn ngay!" khi nốt vào hit window]

  [Bỏ qua]          [Sẵn sàng! Bắt đầu →]
```

Sau khi chơi đủ 3 nốt hoặc bấm "Sẵn sàng" → fade transition sang Game Screen.

---

### 4.3 Game Screen

**Canvas layout (900×600, scale theo viewport):**

```
┌─────────────────────────────────────────────────────┐
│ [Painting mờ brightness:0.35 làm background]        │
│ [Frame viền cũ]                                     │
│                                                     │
│  14/42    BÈO DẠT MÂY TRÔI    ✦×3    00:38         │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  PERFECT!                                           │
│                                                     │
│  [A] [W] [E] [D] [X] [Z]   ← key hints             │
│                                                     │
│  ┌─── ĐÀN BẦU FLAT OVERLAY (Canvas) ───────────┐   │
│  │  ╔══════════════════════════════════════╗    │   │
│  │  ║  ○──●──○──●──○──○ ~~string~~ ○  🎋  ║   │   │
│  │  ╚══════════════════════════════════════╝    │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ progress        │
│  Bèo Dạt Mây Trôi              0:18 / 0:52         │
│                                                     │
│                          2,850  ĐIỂM                │
└─────────────────────────────────────────────────────┘
```

**Instrument overlay (Canvas riêng, absolute positioned):**
- Đàn bầu flat horizontal, đầy đủ texture gỗ + khảm xà cừ
- Dây vàng với 6 harmonic nodes
- Cần đàn bên phải, animate theo mouse Y realtime
- Quả bầu (gourd) phía dưới cần đàn

**Note system:**
- Nốt (hạt sáng) xuất phát từ ngoài phải, chạy sang trái dọc theo dây
- Đến đúng node target → hit window mở (0.2s)
- Player nhấn đúng phím trong window → HIT
- Sau khi hit: string vibration animation + PERFECT/GOOD flash + ripple

**HUD elements:**
- Top bar: `note_count / total · SONG_NAME · ✦ STREAK_MULT · TIMER`
- Bottom: progress bar với playhead + song name + timestamp
- Center bottom: điểm số lớn
- Flash text: PERFECT (vàng), GOOD (xanh gốm), MISS (đỏ mờ)

---

### 4.4 Result Screen

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ [Painting mờ blur background]                       │
│                                                     │
│              KẾT QUẢ                               │
│           Bèo Dạt Mây Trôi                         │
│                                                     │
│      ┌────┐                                         │
│      │ S  │   2,850   điểm                         │
│      └────┘   97%     độ chính xác                 │
│               14/42   nốt hoàn hảo                 │
│               ×3      chuỗi dài nhất               │
│                                                     │
│  ─────────────────────────────────────────────     │
│                                                     │
│  💡 Bạn có biết?                                   │
│  "Đàn bầu xuất hiện từ thế kỷ XIII, được ghi       │
│   chép trong Đại Việt sử ký toàn thư."             │
│                                                     │
│  [Chơi Lại]              [Chia Sẻ]                 │
└─────────────────────────────────────────────────────┘
```

**Grade thang điểm:**
| Grade | Ngưỡng | Màu |
|-------|--------|-----|
| S | ≥ 90% accuracy | `#f0d060` vàng |
| A | ≥ 75% | `#c4953a` đồng |
| B | ≥ 55% | `#d4bc80` kem |
| C | < 55% | `#8a7050` mờ |

**Nút Chia Sẻ:** Copy URL với query `?score=2850&grade=S` vào clipboard → toast "Đã copy link!"

---

## 5. Cơ chế điều khiển

### 5.1 Keyboard — Gảy nốt

| Phím | Nốt | Tần số | Node |
|------|-----|--------|------|
| A | C4 | 261.63 Hz | 1 |
| W | D4 | 293.66 Hz | 2 |
| E | E4 | 329.63 Hz | 3 |
| D | G4 | 392.00 Hz | 4 |
| X | A4 | 440.00 Hz | 5 |
| Z | C5 | 523.25 Hz | 6 |

### 5.2 Mouse — Cần đàn (Pitch Bend)

- **Giữ chuột trái + kéo lên:** pitch tăng (cần đàn nghiêng lên)
- **Giữ chuột trái + kéo xuống:** pitch giảm (cần đàn nghiêng xuống)
- **Thả chuột:** cần đàn spring về vị trí 0 (`SPRING_SPEED = 3.5`)
- **Range:** ±1.5 semitone (`MAX_BEND_RATIO = 2^(1.5/12) - 1`)
- **Rung tay nhanh:** vibrato tự nhiên (LFO từ mouse oscillation)
- **Mouse nhận ở toàn bộ canvas** — không cần click đúng vùng nào

### 5.3 Hit Windows

```
PERFECT:  |Δt| ≤ 0.10s  → +100 điểm, flash vàng
GOOD:     |Δt| ≤ 0.20s  → +50  điểm, flash xanh
MISS:     |Δt| > 0.20s  → +0   điểm, flash đỏ mờ
```

### 5.4 Streak Multiplier

```
0–4  nốt liên tiếp:  ×1.0
5–9  nốt:            ×1.5  (hiệu ứng lửa nhẹ)
10+  nốt:            ×2.0  (dây sáng vàng rực)
Reset khi MISS
```

---

## 6. Audio Engine

```js
// Mỗi nốt dùng 4 oscillator sine:
osc1: baseFreq           // gain 0.40
osc2: baseFreq * 1.003   // gain 0.32 (detune warmth)
osc3: baseFreq * 2.01    // gain 0.18 (2nd harmonic)
osc4: baseFreq * 0.501   // gain 0.10 (sub-harmonic mờ — mới)

// Effects chain:
oscillators → GainNode (master envelope) → HPF (180Hz) → ConvolverNode (reverb) → Destination

// Envelope (pluck feel):
attack:  0.015s  linearRamp to 0.65
decay1:  0.25s   exponentialRamp to 0.38
sustain: exponentialRamp to 0.001 (duration + 0.8s)

// Pitch bend:
setTargetAtTime(baseFreq * bendRatio, now, 0.04)  // smooth, không click

// Vibrato LFO (sau 0.5s giữ nốt):
LFOFreq: 5.5 Hz, depth: 0.003 * baseFreq

// Reverb:
ConvolverNode với impulse response ngắn (~0.8s) — tổng hợp bằng noise decay
```

---

## 7. Bài nhạc — Bèo Dạt Mây Trôi

**Format note:**
```js
{
  id:       number,
  time:     number,   // giây kể từ khi bài bắt đầu
  key:      string,   // 'a'|'w'|'e'|'d'|'x'|'z'
  duration: number,   // giây giữ nốt
  bend:     'none'|'up'|'down'|'vibrato'  // gợi ý bend (hiển thị hint)
}
```

~42 nốt, tổng thời gian ~52 giây. Countdown 1.5 giây trước khi nốt đầu tiên xuất hiện.

---

## 8. Nội dung văn hóa

### 8.1 Quote — Start Screen

> *"Tiếng đàn bầu của ta*  
> *Cung đàn dân tộc*  
> *Lời ca đất nước"*  
> — Nguyễn Đình Thi

Hiển thị mờ (`opacity: 0.35`) ở giữa painting, không che nội dung chính.

### 8.2 Tagline — dưới title

> "Nhạc cụ một dây · 700 năm lịch sử Việt Nam"

### 8.3 Fun Facts — Result Screen (rotate ngẫu nhiên)

```js
const FACTS = [
  {
    title: "Lịch sử 700 năm",
    text: "Đàn bầu xuất hiện từ thế kỷ XIII, được ghi chép trong Đại Việt sử ký toàn thư — một trong những nhạc cụ lâu đời nhất Đông Nam Á."
  },
  {
    title: "Vật lý hài âm",
    text: "Không có phím, không có ngăn — người chơi chạm nhẹ vào các điểm hài âm tự nhiên (1/2, 1/3, 2/3 dây) để tạo ra các nốt khác nhau, giống như guitar harmonics."
  },
  {
    title: "Quả bầu kỳ diệu",
    text: "Hộp cộng hưởng của đàn bầu là quả bầu nước (calabash) khô — không điện, không micro. Hình dáng và độ dày vỏ quyết định màu âm của cả cây đàn."
  },
  {
    title: "Di sản UNESCO",
    text: "Nghệ thuật đàn bầu là một trong những di sản văn hóa phi vật thể đại diện của Việt Nam, được quốc tế công nhận và bảo tồn."
  }
]
```

---

## 9. Cấu trúc file

```
dan_bau_demp/
├── public/
│   └── bg-painting.webp       ← tranh nền (<400KB, optimize)
├── src/
│   ├── main.jsx
│   ├── App.jsx                ← router 4 screens + state phase
│   │
│   ├── screens/
│   │   ├── StartScreen.jsx
│   │   ├── TutorialScreen.jsx
│   │   ├── GameScreen.jsx
│   │   └── ResultScreen.jsx
│   │
│   ├── engine/
│   │   ├── audioEngine.js     ← Web Audio: oscillators, reverb, bend
│   │   ├── gameEngine.js      ← game loop (useRef RAF)
│   │   └── songData.js        ← Bèo Dạt Mây Trôi note array
│   │
│   ├── canvas/
│   │   ├── drawInstrument.js  ← đàn body, cần đàn, string
│   │   ├── drawNotes.js       ← nốt moving + ripple + flash
│   │   └── drawHUD.js         ← timer, streak, score overlay
│   │
│   ├── constants/
│   │   ├── colors.js          ← palette từ tranh
│   │   ├── layout.js          ← canvas dimensions, positions
│   │   └── facts.js           ← mảng 4 fun facts
│   │
│   ├── hooks/
│   │   ├── useGameEngine.js   ← game loop hook
│   │   └── useAudio.js        ← AudioContext management
│   │
│   └── index.css              ← frame, painting, font, global
```

**Không dùng:** Redux, Zustand, Three.js, game libs ngoài.  
**State management:** `useRef` cho game loop (RAF), `useState` cho phase transitions.

---

## 10. Transition giữa màn hình

| Transition | Effect |
|---|---|
| Start → Tutorial | Fade in overlay tối 0.5s, painting mờ dần |
| Tutorial → Game | Fade 0.4s, đàn flat slide lên từ dưới |
| Game → Result | Nốt cuối kết thúc → fade 0.6s → result |
| Result → Game | Instant reset + fade 0.3s |

---

## 11. Responsive & Performance

- **Target:** Desktop 1280×720+ (primary), không tối ưu mobile
- **Canvas scale:** `Math.min(window.innerWidth/900, window.innerHeight/600)`
- **60fps:** RAF game loop, không redraw khi pause
- **Image:** `bg-painting.webp` optimize dưới 400KB, lazy-decode
- **Audio:** Lazy init AudioContext khi user gesture đầu tiên

---

*Spec này là nguồn sự thật duy nhất cho việc implementation.*  
*Mọi quyết định code nên tham chiếu về tài liệu này.*
