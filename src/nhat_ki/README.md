# Nhật kí du lạc

Demo web độc lập cho cơ chế nhật kí trong game: khi người chơi gặp NPC hoặc hoàn thành thử thách văn hóa, quyển nhật kí tự thêm hình, ghi chú và thông tin vào trang tương ứng.

## Công nghệ

- React + TypeScript + Vite
- React Konva/Konva để dựng quyển sổ và các mảnh scrapbook trên canvas
- Lucide React cho icon trong các nút điều khiển

## Cách chạy

```bash
npm install
npm run dev
```

Sau đó mở URL mà Vite in ra, thường là `http://localhost:5173`.

## Nội dung demo hiện có

Nhật kí có 6 trang văn hóa ban đầu:

- Đàn bầu
- Ô ăn quan
- Chợ Việt Nam
- Đền làng
- Hội làng
- Cuộc sống người dân miền Bắc

Ở bản demo này, người dùng bấm các nút trong panel "Sự kiện mở khóa" để giả lập việc gặp NPC hoặc hoàn thành thử thách. Khi một sự kiện được kích hoạt, app sẽ:

1. Đánh dấu mục văn hóa là đã khám phá.
2. Tự chuyển đến cặp trang chứa mục đó.
3. Vẽ hình minh họa, giấy note, dòng chữ viết tay và ghi chú lên canvas.
4. Cập nhật trạng thái tiến độ mở khóa.

## Cấu trúc chính

```text
src/
  App.tsx
  App.css
  index.css
  components/
    TravelJournalCanvas.tsx
  data/
    journalEntries.ts
  assets/
    journal/
      photos/
      paper/
```

- `src/data/journalEntries.ts`: dữ liệu các trang văn hóa, NPC, địa điểm, nội dung ghi chú và kiểu hình minh họa.
- `src/components/TravelJournalCanvas.tsx`: canvas quyển nhật kí, gồm nền sổ, trang khóa, trang đã mở và các mảnh scrapbook có thể kéo.
- `src/App.tsx`: state mở khóa, điều hướng trang, panel sự kiện và panel chi tiết.
- `src/assets/journal/photos`: ảnh minh họa chính cho từng chủ đề.
- `src/assets/journal/paper`: sticker/ảnh giấy trang trí đặt lên trang nhật kí.

## Asset đang được dùng

Ảnh chính:

- `src/assets/journal/photos/dan-bau.png`
- `src/assets/journal/photos/o-an-quan.png`
- `src/assets/journal/photos/cho-viet-nam.png`
- `src/assets/journal/photos/den-lang.png`
- `src/assets/journal/photos/hoi-lang.png`
- `src/assets/journal/photos/mien-bac.png`

Sticker/trang trí:

- `src/assets/journal/paper/dan_bau.png`
- `src/assets/journal/paper/o_an_quan.png`
- `src/assets/journal/paper/gio.png`
- `src/assets/journal/paper/dinh_lang.png`
- `src/assets/journal/paper/trong.png`
- `src/assets/journal/paper/rice.png`

## Cách thêm một mục văn hóa mới

Thêm một object mới vào `journalEntries`:

```ts
{
  id: 'ten-muc-moi',
  title: 'Tên mục mới',
  shortTitle: 'Mục mới',
  type: 'npc',
  triggerLabel: 'Gặp NPC mới',
  npcName: 'Tên NPC',
  location: 'Địa điểm',
  page: 6,
  accent: '#8a4f2f',
  imageTone: '#e6bd7a',
  stamp: 'Chủ đề',
  summary: 'Đoạn tóm tắt ngắn.',
  notes: ['Ghi chú 1', 'Ghi chú 2', 'Ghi chú 3'],
  sketch: 'market',
}
```

Hiện tại canvas đang hiển thị theo cặp trang, nên khi thêm nhiều mục mới cần đảm bảo tổng số trang là số chẵn hoặc bổ sung xử lý trang trống.

## Hướng tích hợp với game thật

Về sau, thay vì bấm nút demo, game có thể gọi một hàm/event tương tự:

```ts
unlockEntry('dan-bau')
```

Các trigger có thể đến từ:

- NPC conversation: người chơi hỏi đúng chủ đề hoặc nghe hết đoạn thoại.
- Challenge complete: người chơi thắng trò chơi, giải câu đố hoặc hoàn thành nhiệm vụ.
- World discovery: người chơi đi vào khu vực văn hóa, xem vật phẩm hoặc tương tác với địa danh.

## Việc nên làm tiếp theo

- Thay hình minh họa Konva bằng asset thật hoặc ảnh vẽ riêng.
- Lưu trạng thái mở khóa vào localStorage hoặc save game.
- Thêm hiệu ứng viết chữ/dán ảnh từng bước khi trang được mở.
- Thêm chế độ kéo, xoay, scale có toolbar giống scrapbook editor.
- Tách hệ thống event thành service riêng để dễ nối với game engine.
