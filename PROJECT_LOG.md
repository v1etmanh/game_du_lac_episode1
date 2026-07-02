# PROJECT LOG — DU LẠC DIARY

Nhật ký hành động tự động (theo quy ước 3 giai đoạn: Truy vấn ngữ cảnh → Thực thi → Ghi log).

---

## [2026-07-02 08:00] - Khảo sát cấu trúc dự án lần đầu
- **Hành động**: Không tìm thấy CONTEXT.md/ARCHITECTURE.md ở gốc dự án `D:\dream_project\game`. Đã dùng `list_directory` (depth 4) để khảo sát toàn bộ cây thư mục thay thế. Đọc `Readme.md` (rỗng), `cot_truyen.md` (897 dòng - kịch bản game đầy đủ), và `public/output.png` (mockup giao diện "Chọn địa điểm").
- **Tác động**: Không thay đổi file nào. Chỉ đọc để nắm tình hình thực tế.
- **Ghi chú cho tương lai**:
  - Dự án hiện **chỉ có tài liệu + asset** (cot_truyen.md, Readme rỗng, ảnh trong `public/background`, `public/landscape`, `public/npc_avt`, `public/video`, và `public/output.png`). **Chưa có source code** (không có `src/`, không có `package.json`, chưa khởi tạo React app).
  - `cot_truyen.md` có nhắc đến Godot + Dialogue Manager plugin ở cuối file — đây là gợi ý cũ/không nhất quán, vì yêu cầu thực tế của chủ dự án (2026-07-02) là build bằng **React + HTML Canvas + CSS**, không dùng Godot.
  - Nên tạo `CONTEXT.md`/`ARCHITECTURE.md` ở gốc dự án khi bắt đầu code, để các phiên làm việc sau không phải quét lại toàn bộ thư mục.

---

## [2026-07-02 08:20] - Khởi tạo dự án React (Vite) + màn hình Intro Video
- **Hành động**:
  - Xác nhận lại: vẫn chưa có CONTEXT.md/ARCHITECTURE.md ở gốc, `public/video` đã có sẵn `video1.mp4`, `video2.mp4`, `video3.mp4` (đã được đổi tên đúng thứ tự).
  - Tạo bộ khung dự án React + Vite (thuần CSS, chưa dùng canvas ở bước này): `package.json`, `vite.config.js`, `index.html`, `.gitignore`, `src/main.jsx`, `src/App.jsx` (+ `App.css`), `src/index.css`.
  - Tạo component `src/components/IntroSequence.jsx` (+ `IntroSequence.css`): phát lần lượt `video1 -> video2 -> video3` từ `public/video`, mỗi lần click màn hình sẽ chuyển sang video kế tiếp; sau khi click ở video3 sẽ chuyển sang màn hình chữ "Du Lạc Diary — EPISODE 1" (có hiệu ứng fade-in + nhấp nháy "Nhấn để bắt đầu"). `App.jsx` hiện có state `screen` ('intro' -> 'map'), màn 'map' mới là placeholder chờ bước sau.
  - Chạy `npm install` (63 packages, OK) và `npm run build` để xác nhận không có lỗi cú pháp/build — build thành công (580ms).
- **Tác động**: Dự án từ chỗ chỉ có asset đã có bộ khung React chạy được (`npm run dev` để xem thử). Chưa đụng tới các file kịch bản/asset cũ.
- **Ghi chú cho tương lai**:
  - Cấu trúc `src/` hiện tại: `main.jsx`, `App.jsx` (+ `App.css`), `index.css`, `components/IntroSequence.jsx` (+ `.css`).
  - `App.jsx` dùng state machine đơn giản (`screen`), các màn tiếp theo cần thêm: `map` (bản đồ chọn địa điểm, dùng ảnh mockup `public/output.png` làm tham chiếu UI thẻ bài), `dialog` (hội thoại NPC, avatar tại `public/npc_avt`), `minigame` (container cho từng mini-game riêng theo địa điểm).
  - Danh sách NPC hội thoại theo địa điểm (theo yêu cầu người dùng 2026-07-02): cổng làng + đền làng → gia_lang; nhà bà tư → ba_tu; nhà bà ngần → ba_ngan; vườn cây → bacnongdan; nhà minh → minh; nhà hùng → hung; chợ → bacnongdan. Các địa điểm KHÔNG có dialog NPC (chỉ có puzzle/minigame): chùa, ao làng, giếng, ruộng.
  - Video intro dùng thuộc tính `autoPlay muted loop playsInline` để tránh bị chặn autoplay trên trình duyệt; đang loop từng video chờ người chơi click để qua video kế — có thể cần đổi UX nếu muốn tự động chuyển khi video kết thúc.

---

## [2026-07-02 08:45] - Xây màn hình "Chọn địa điểm" (LocationMap) từ background + landscape
- **Hành động**:
  - Truy vấn lại thực tế: chưa có CONTEXT.md/ARCHITECTURE.md. Liệt kê `public/background` (1 ảnh nền `Gemini_Generated_Image_493p7z493p7z493p.png`) và `public/landscape` — phát hiện 11 file đã được đổi tên khớp id địa điểm: `ao_lang, canh_dong, cho, chua, cong_lang, den_lang, gieng_lang, nha_ba_ngan, nha_ba_tu, nha_hung, nha_minh, vuon_cay`. Liệt kê lại `public/npc_avt`: `bacnongdan, ba_ngan, ba_tu, gialang, hung, lananh, minh, tinh`.
  - Tạo `src/data/locations.js` — danh sách 12 địa điểm (id, tên, mô tả, ảnh, npc phụ trách dialog hoặc null, trạng thái unlocked/completed) khớp đúng bảng địa điểm/NPC người dùng cung cấp: cổng làng + đền làng → gialang; nhà bà tư → ba_tu; nhà bà ngần → ba_ngan; vườn cây + chợ → bacnongdan; nhà minh → minh; nhà hùng → hung; chùa/ao làng/giếng/ruộng (canh_dong) → không có NPC (npc: null).
  - Tạo `src/data/npcs.js` — map id NPC -> tên hiển thị + đường dẫn avatar trong `public/npc_avt` (dùng cho bước xây dialog kế tiếp).
  - Tạo component `LocationCard.jsx/.css` (thẻ bài phong cách giấy cũ, có trạng thái selected/locked/shaking) và `LocationMap.jsx/.css` (màn bản đồ: ảnh nền phủ full màn hình, header "✦ CHỌN ĐỊA ĐIỂM ✦" + nút back, 2 hàng x 6 thẻ phía dưới, click 1 lần = chọn, click lần 2 khi đã chọn = vào địa điểm; click thẻ khoá sẽ rung nhẹ).
  - Nối vào `App.jsx`: thêm state `activeLocation`; khi vào 1 địa điểm, nếu có `npc` thì chuyển `screen='dialog'`, không có thì `screen='minigame'` — cả 2 hiện đang là placeholder có nút "Quay lại bản đồ".
  - Chạy `npm run build` — thành công, không lỗi (39 modules, 651ms).
- **Tác động**: Có màn hình chọn địa điểm hoạt động đầy đủ (chọn/khoá/rung), điều hướng intro → map → placeholder dialog/minigame theo đúng từng địa điểm.
- **Ghi chú cho tương lai**:
  - Bước tiếp theo hợp lý: (1) xây màn `DialogScreen` dùng `src/data/npcs.js` để hiển thị avatar + hộp thoại kiểu "giấy cũ"/"hoa văn VN" (theo gợi ý cuối `cot_truyen.md`) cho 7 địa điểm có NPC; (2) xây khung `MinigameScreen` chung (container HTML canvas) cho các minigame theo từng địa điểm, bắt đầu với các địa điểm không có dialog (chua, ao_lang, gieng_lang, ruong) vì logic đơn giản hơn (chỉ là câu đố/puzzle).
  - Hiện tại chỉ `cong_lang` và `vuon_cay` có `unlocked: true`; cần có hệ thống lưu tiến trình (progress state, có thể dùng localStorage hoặc context) để tự động mở khoá các địa điểm tiếp theo sau khi hoàn thành, theo đúng bảng "Sơ đồ điều kiện mở khoá" trong `cot_truyen.md`.
  - `LocationMap.jsx` đang nhận toàn bộ danh sách từ `LOCATIONS` tĩnh trong `data/locations.js` — khi có hệ thống lưu tiến trình, cần tách trạng thái `unlocked/completed` ra khỏi file data tĩnh này.

---

## [2026-07-02 09:10] - Xây màn hội thoại NPC (DialogScreen) đọc từ src/dialog/*.json
- **Hành động**:
  - Truy vấn lại: chưa có CONTEXT.md/ARCHITECTURE.md. Liệt kê `src/` phát hiện thư mục `src/dialog` đã có sẵn 12 file JSON (khớp đủ 12 địa điểm) do người dùng tạo trước. Đọc toàn bộ 12 file để xác nhận cấu trúc thật: mỗi file có `locationId, locationName, description, npcId, dialogues[]` — mỗi dòng dialogues có `speaker, speakerName, text`.
  - Phát hiện thực tế khác với giả định trước: **cả 12 địa điểm đều có hội thoại** (kể cả `chua`, `ao_lang`, `gieng_lang`, `ruong` — 4 nơi này hội thoại chỉ giữa `lan_anh`/`tinh`, riêng `chua` có thêm NPC `sucu` (Sư Cụ) chưa từng khai báo trước đó và **chưa có ảnh avatar** trong `public/npc_avt`).
  - Cập nhật `src/data/npcs.js`: đổi thành `CHARACTERS` đầy đủ gồm cả `lan_anh` (lananh.png), `tinh` (tinh.png) và NPC `sucu` (avatar: null — chưa có ảnh, UI sẽ fallback chữ cái đầu). Giữ `export const NPCS = CHARACTERS` để tương thích ngược.
  - Tạo `src/components/DialogScreen.jsx` (+ `.css`): dùng `import.meta.glob('../dialog/*.json', { eager: true })` để nạp sẵn toàn bộ dialog lúc build, tra theo `locationId`. Giao diện: nền = ảnh `public/landscape/{locationId}.png`, chân dung nhân vật đang nói nổi lớn bên trái (lan_anh/tinh) hoặc bên phải (NPC) với fallback vòng tròn chữ cái nếu thiếu avatar, hộp thoại giấy-tối phía dưới hiển thị tên + lời thoại + tiến độ (x/6), click màn hình để sang câu tiếp, click ở câu cuối sẽ gọi `onFinish(data)` để sang minigame.
  - Sửa `App.jsx`: bỏ điều kiện "chỉ địa điểm có `npc` mới vào dialog" — nay MỌI địa điểm đều `setScreen('dialog')` vì tất cả đều có file json. Sau khi `DialogScreen` gọi `onFinish` mới chuyển `screen='minigame'` (vẫn placeholder).
  - `npm run build` — thành công (54 modules, 553ms — tăng đúng 12 module so với lần build trước vì đã import 12 file json qua glob).
- **Tác động**: Luồng chơi đầy đủ hiện tại: Intro (3 video) → Map (chọn địa điểm) → Dialog (đọc từ file json thật, có avatar) → placeholder Minigame. Toàn bộ 12 địa điểm đều chơi được đến hết dialog.
- **Ghi chú cho tương lai**:
  - Thiếu ảnh avatar cho NPC `sucu` (Sư Cụ) trong `public/npc_avt` — nếu người dùng bổ sung file (gợi ý đặt tên `sucu.png`), chỉ cần sửa `avatar: null` → `'/npc_avt/sucu.png'` trong `src/data/npcs.js`.
  - `npcId` trong từng file json hiện chưa được `DialogScreen` dùng tới (chỉ dùng trực tiếp `speaker` của từng dòng) — có thể bỏ qua hoặc dùng để validate dữ liệu sau này.
  - Bước tiếp theo hợp lý: xây `MinigameScreen` — có thể bắt đầu với 1-2 minigame đơn giản trước (vd. mini-game "Đưa gà vào chuồng" ở nhà Bà Tư, hoặc câu đố ở chùa/giếng/ao) làm khung mẫu dùng HTML canvas, rồi nhân rộng ra các địa điểm còn lại.

---

## [2026-07-02 09:30] - Sửa hành vi video Intro: không loop, phải xem hết mới click được
- **Hành động**: Theo yêu cầu + đã phân tích và được người dùng xác nhận trước khi code. Sửa `src/components/IntroSequence.jsx`:
  - Bỏ thuộc tính `loop` khỏi thẻ `<video>` — video chạy 1 lần rồi tự dừng (đóng băng) ở khung hình cuối, không lặp lại.
  - Thêm state `ended`, gắn `onEnded={() => setEnded(true)}` vào video.
  - `handleClick` giờ chỉ xử lý chuyển video/stage khi `ended === true` — click trong lúc video đang chiếu dở sẽ không có tác dụng gì (không cho skip sớm).
  - Hint "Nhấn màn hình để tiếp tục" giờ chỉ hiện ra sau khi video kết thúc (`ended && ...`), thay vì hiện suốt từ đầu như trước.
  - `npm run build` — thành công, không lỗi (54 modules, 616ms).
- **Tác động**: Trải nghiệm intro giờ bắt buộc người chơi xem hết mỗi video (video1 → video2 → video3) rồi mới click để qua video/màn tiếp theo; không còn bị loop hay skip sớm như trước.
- **Ghi chú cho tương lai**: Logic này áp dụng cho cả video cuối (video3) — chiếu xong, dừng, chờ click mới chuyển sang màn chữ "EPISODE 1". Nếu sau này muốn cho phép "tua nhanh/bỏ qua toàn bộ intro", cần thêm 1 nút skip riêng vì hiện tại không có cách nào bỏ qua giữa chừng.
