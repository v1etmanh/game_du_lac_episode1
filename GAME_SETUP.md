# 🎮 Game Configuration Guide

## Cấu hình chính

Tất cả các thiết lập game được quản lý trong file: **`src/config/gameConfig.js`**

### Các tùy chọn:

#### 1. **UNLOCK_ALL_LOCATIONS** ⭐ (Unlock tất cả màn chơi)
```javascript
UNLOCK_ALL_LOCATIONS: true  // Bật: mở khóa tất cả 12 địa điểm
UNLOCK_ALL_LOCATIONS: false // Tắt: chỉ các địa điểm được cài đặt mở khoá
```

**Mặc định:** `true` (tất cả màn đều mở)

Khi bật `true`, tất cả 12 địa điểm sẽ có sẵn:
- ✓ Cổng làng
- ✓ Vườn cây ăn quả
- ✓ Diều sáo trên đồng quê
- ✓ Chợ
- ✓ Nhà bà tư
- ✓ Nhà bà ngần
- ✓ Nhà minh
- ✓ Nhà hùng
- ✓ Đền làng (Ô ăn quan game)
- ✓ Chùa
- ✓ Giếng sau làng
- ✓ Ao làng

---

#### 2. **SKIP_INTRO** (Bỏ qua màn intro)
```javascript
SKIP_INTRO: true  // Bỏ qua phim mở đầu, vào thẳng bản đồ
SKIP_INTRO: false // Xem màn intro (mặc định)
```

---

#### 3. **DEBUG_MODE** (Chế độ debug)
```javascript
DEBUG_MODE: true  // Hiển thị thông tin debug
DEBUG_MODE: false // Tắt (mặc định)
```

---

## 🚀 Cách sử dụng

### Để mở khóa tất cả địa điểm:
Đã mở sẵn! File `gameConfig.js` có `UNLOCK_ALL_LOCATIONS: true`

### Để khóa một số địa điểm:
Chỉnh lại trong `gameConfig.js`:
```javascript
UNLOCK_ALL_LOCATIONS: false
```
Khi đó, chỉ những địa điểm với `unlocked: true` trong `src/data/locations.js` mới được phép chơi.

---

## 📝 Cách hoạt động

1. **App.jsx** đọc config từ `gameConfig.js`
2. Truyền `unlockAll` prop xuống **LocationMap.jsx**
3. **LocationMap.jsx** gọi `getLocations(unlockAll)` từ `locations.js`
4. Hàm này trả về danh sách địa điểm (unlock all nếu cần)
5. Người dùng có thể click vào bất kỳ địa điểm nào đã mở khoá

---

## 🔧 Nếu muốn mở khoá từng địa điểm theo tiến trình:

Thay đổi `UNLOCK_ALL_LOCATIONS: false` trong `gameConfig.js`, sau đó sửa từng dòng trong `src/data/locations.js`:

```javascript
{
  id: 'cho',
  name: 'Chợ',
  unlocked: true,  // ← Đổi từ false thành true
}
```

