// Toàn bộ nhân vật xuất hiện trong dialog (2 nhân vật chính + NPC).
// avatar: null nghĩa là chưa có ảnh trong public/npc_avt -> UI sẽ dùng fallback (chữ cái đầu tên).
export const CHARACTERS = {
  lan_anh: {
    name: 'Lan Anh',
    avatar: '/npc_avt/lananh.png',
    portrait: { scale: 0.88, y: '6px', mobileScale: 0.76 },
  },
  tinh: {
    name: 'Tính',
    avatar: '/npc_avt/tinh.png',
    portrait: { scale: 0.96, x: '4px', y: '8px', mobileScale: 0.84 },
  },
  gialang: {
    name: 'Ông Trưởng Làng',
    avatar: '/npc_avt/gialang.png',
    portrait: { scale: 1.68, x: '-26px', y: '10px', mobileScale: 1.34 },
  },
  bacnongdan: {
    name: 'Bác Nông Dân',
    avatar: '/npc_avt/bacnongdan.png',
    portrait: { scale: 1.8, x: '-22px', y: '12px', mobileScale: 1.42 },
  },
  ba_tu: {
    name: 'Bà Tư',
    avatar: '/npc_avt/ba_tu.png',
    portrait: { scale: 0.94, x: '-6px', y: '6px', mobileScale: 0.82 },
  },
  ba_ngan: {
    name: 'Bà Ngần',
    avatar: '/npc_avt/ba_ngan.png',
    portrait: { scale: 1.82, x: '-22px', y: '12px', mobileScale: 1.44 },
  },
  minh: {
    name: 'Minh',
    avatar: '/npc_avt/minh.png',
    portrait: { scale: 2.45, x: '10px', y: '14px', mobileScale: 1.76 },
  },
  hung: {
    name: 'Hùng',
    avatar: '/npc_avt/hung.png',
    portrait: { scale: 1.34, x: '-18px', y: '10px', mobileScale: 1.1 },
  },
  sucu: { name: 'Sư Cụ', avatar: null },
}

// Giữ tên cũ để tương thích ngược với chỗ đã import NPCS trước đó.
export const NPCS = CHARACTERS
