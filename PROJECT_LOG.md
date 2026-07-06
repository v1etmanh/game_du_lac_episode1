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

---

## [2026-07-05] - Giới hạn chiều dài dây diều theo màn hình thực tế (src/tha_dieu)
- **Hành động**: Truy vấn ngữ cảnh thật trước khi sửa (không đoán mò): đọc `Rope.ts`, `RopeSystem.ts`, `Game.ts`, `Camera.ts`, `Input.ts`, `Renderer.ts`, `RenderSystem.ts`. Xác định nguyên nhân: `Rope.maxLength` là hằng số cố định 390, không liên quan tới chiều cao canvas thực tế (`Renderer.height` tối thiểu chỉ 420px) và vùng nhìn thấy phía trên người chơi chỉ bằng `viewportHeight * 0.58` (xem `Camera.update`) — nên khi người chơi giữ phím S/E (hoặc chuột phải nhả dây) kéo dây tới max 390, diều dư sức bay vượt mép trên màn hình ở các màn hình nhỏ/vừa.
  - Sửa `src/tha_dieu/src/physics/Rope.ts`: đổi `maxLength` từ hằng số cố định thành thuộc tính có thể thay đổi, thêm `absoluteMaxLength = 390` (trần tuyệt đối) và hàm `updateMaxLengthForViewport(viewportHeight)` tính `maxLength` động = `clamp(viewportHeight * 0.58 - 130, minLength + 20, absoluteMaxLength)` (130 = khoảng đệm an toàn cho thân + đuôi diều).
  - Sửa `src/tha_dieu/src/systems/RopeSystem.ts`: `updateLength()` nhận thêm tham số `viewportHeight`, gọi `rope.updateMaxLengthForViewport(viewportHeight)` mỗi khung hình trước khi clamp `rope.length`.
  - Sửa `src/tha_dieu/src/engine/Game.ts`: truyền `this.renderer.height` thật vào `this.ropeSystem.updateLength(...)`.
  - Chạy `npx tsc --noEmit -p tsconfig.json` trong `src/tha_dieu` — biên dịch sạch, exit code 0, không lỗi type.
- **Tác động**: Dây diều giờ không thể kéo dài vượt quá mức an toàn tương ứng với chiều cao màn hình thực tế của người chơi (co giãn tự động theo `resize`), nên diều không còn bay vượt mép trên màn hình khi giữ phím S để nhả dây dài hết cỡ. Với màn hình lớn, giới hạn vẫn có thể tiệm cận 390 (thiết kế gốc); với màn hình nhỏ, giới hạn tự giảm xuống mức an toàn (tối thiểu `minLength + 20 = 110`).
- **Ghi chú cho tương lai**:
  - HUD (`ui/HUD.tsx`) hiển thị `snapshot.maxRopeLength` — do lấy trực tiếp từ `rope.maxLength` nên sẽ tự phản ánh đúng giới hạn động, không cần sửa gì thêm.
  - Hệ số đệm an toàn (130px) và tỉ lệ `0.58` đang giả định thân diều bán kính ~22 + đuôi diều dài ~70; nếu sau này đổi asset diều lớn/nhỏ hơn đáng kể, nên rà lại hằng số `kiteSafetyMargin` trong `Rope.updateMaxLengthForViewport`.
  - Chưa kiểm thử thủ công bằng cách chạy `npm run dev` và bấm phím S thực tế trên trình duyệt (chỉ mới xác nhận qua `tsc --noEmit`) — nên người dùng nên tự trải nghiệm lại minigame thả diều để xác nhận cảm giác chơi (max length mới có thể khiến dây thả không được dài như trước ở màn hình nhỏ).

## [2026-07-06] - Thêm màn hướng dẫn (tutorial) trước 3 minigame: lua_ga, tha_dieu, hai_qua

- Tác động:
  - Tạo mới component dùng chung `src/components/GameTutorial.jsx` + `GameTutorial.css`: overlay full-screen hiển thị tên game, mục tiêu, bảng phím điều khiển, mẹo chơi và nút "Bắt đầu" / "Quay lại bản đồ".
  - Sửa `src/games/lua_ga/LuaGaGame.jsx`: thêm state `started`, hiển thị `GameTutorial` trước khi render `SimulationCanvas`. Nội dung control lấy từ `src/lua_ga/README.md` (WASD/mũi tên, Shift sprint, Z thả thóc, X dash, C vỗ tay, F mở/đóng cổng).
  - Sửa `src/games/hai_qua/HaiQuaGame.jsx`: thêm state `started`, hiển thị `GameTutorial` trước khi render `HaiQuaApp`. Nội dung control lấy từ `src/hai_qua/readme.md` (di chuyển, Shift sprint, Space nhảy, Q rung cây, chạm để bắt quả).
  - Sửa `src/components/KiteFieldGame.jsx` (wrapper minigame Thả diều dùng cho địa điểm `ruong`): thêm state `started`, hiển thị `GameTutorial` trước khi render `KiteGame` (`src/tha_dieu/src/App.tsx`). Nội dung control lấy từ `src/tha_dieu/src/engine/Input.ts` (A/D hoặc mũi tên di chuyển, Space/chuột trái nhảy, Q/chuột phải giữ để thu dây, S thả dây, R chơi lại, Esc tạm dừng).
  - Không đổi logic gameplay/App.jsx/luồng màn hình hiện có — chỉ chèn thêm 1 bước màn hình tutorial trước khi các component game gốc được mount.

- Ghi chú cho tương lai:
  - Nếu muốn thêm tutorial cho các minigame còn lại (ban_hang, dan_bau, oanquan, phong_su, nha_cu/giai_do), tái sử dụng `GameTutorial` component, chỉ cần soạn `title/objective/controls/tips` phù hợp rồi gate màn game gốc bằng state `started` giống pattern ở 3 file trên.
  - `GameTutorial` nhận prop `accent` (mã màu hex) để đổi tông màu theo chủ đề từng game; hiện dùng: lua_ga #c8952e (vàng đất), hai_qua #7fae3f (xanh lá), tha_dieu #3f8fae (xanh da trời).
  - Chưa test chạy dev server (vite) sau khi sửa — nên chạy `npm run dev` ở thư mục gốc `D:\dream_project\game` để kiểm tra 3 minigame trên trước khi build production.

## [2026-07-06] - Sửa lỗi thiếu file GameTutorial.jsx/.css (import resolve failed)

- Hành động: Phát hiện lỗi Vite "Failed to resolve import '../../components/GameTutorial.jsx'" do lần trước tạo 2 file `GameTutorial.jsx` và `GameTutorial.css` bằng nhầm tool (tool sandbox nội bộ) thay vì Desktop Commander, nên file không thực sự tồn tại trong `D:\dream_project\game\src\components`. Đã tạo lại đúng cả 2 file bằng `desktop-commander:write_file` (chia nhỏ theo từng đoạn ≤40 dòng).
- Tác động: `src/components/GameTutorial.jsx` và `src/components/GameTutorial.css` giờ tồn tại thật trên máy, nội dung giống bản thiết kế ban đầu (overlay tutorial dùng chung cho lua_ga, tha_dieu, hai_qua). Đã xác nhận lại bằng `list_directory` và `read_file` — file đầy đủ, JSX hợp lệ. Không cần sửa gì thêm ở 3 file wrapper (`LuaGaGame.jsx`, `HaiQuaGame.jsx`, `KiteFieldGame.jsx`) vì các file này đã được ghi đúng bằng Desktop Commander từ đầu.
- Ghi chú cho tương lai: LUÔN dùng `desktop-commander:write_file` (không dùng tool tạo file sandbox nội bộ) khi tạo/sửa file trong project thật ở `D:\dream_project\game`, vì tool sandbox không ghi vào ổ đĩa thật của người dùng. Nên chạy `npm run dev` và thử vào lại 3 địa điểm `nha_ba_ngan`, `ruong`, `vuon_cay` để xác nhận màn tutorial hiện đúng và lỗi import đã hết.

## [2026-07-06] - Thêm màn hướng dẫn (tutorial) cho minigame phong_su

- Hành động: Tiếp tục việc thêm `GameTutorial` cho các minigame còn lại (theo ghi chú của phiên trước). Sửa `src/games/phong_su/PhongSuGame.jsx` bằng `desktop-commander:edit_block`: thêm state `started`, import `GameTutorial` từ `../../components/GameTutorial.jsx`, hiển thị màn tutorial trước khi render `PhongSuApp`. Nội dung tutorial soạn dựa trên việc đọc thật `src/phong_su/src/App.jsx` và `InterviewScene.jsx` để mô tả đúng cơ chế game (chọn NPC trong làng → phỏng vấn bằng cách gõ câu hỏi hoặc chọn gợi ý từ sổ tay 📔 → thu thập đủ chứng cứ → viết bài báo 📰), không phải điều khiển bàn phím như 3 game trước.
- Tác động: `PhongSuGame` giờ có màn tutorial riêng (accent đỏ mực báo `#a8433a`) trước khi vào game, cùng pattern với `lua_ga`, `hai_qua`, `tha_dieu`. Đã chạy `npm run build` ở gốc dự án — build thành công (1922 modules, 4.61s), không lỗi.
- Ghi chú cho tương lai:
  - Danh sách minigame còn thiếu tutorial theo ghi chú trước: `ban_hang`, `dan_bau`, `oanquan`, `nha_cu/giai_do`. Có thể áp dụng đúng pattern này (đọc file component gốc để hiểu cơ chế thật trước khi soạn `controls`/`tips`, tránh đoán mò).
  - Chưa chạy `npm run dev` để tự tay xác nhận UI tutorial hiển thị đúng trong trình duyệt — chỉ mới xác nhận qua `npm run build` (build sạch). Nên vào thử địa điểm có `phong_su` (nhà Hùng / Ông Tư / Bà Năm tuỳ theo `INTERVIEW_BY_LOCATION` trong `App.jsx`) để xem trực tiếp.
