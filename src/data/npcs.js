// Toàn bộ nhân vật xuất hiện trong dialog (2 nhân vật chính + NPC).
// avatar: null nghĩa là chưa có ảnh trong public/npc_avt -> UI sẽ dùng fallback (chữ cái đầu tên).
export const CHARACTERS = {
  lan_anh: { name: 'Lan Anh', avatar: '/npc_avt/lananh.png' },
  tinh: { name: 'Tính', avatar: '/npc_avt/tinh.png' },
  gialang: { name: 'Ông Trưởng Làng', avatar: '/npc_avt/gialang.png' },
  bacnongdan: { name: 'Bác Nông Dân', avatar: '/npc_avt/bacnongdan.png' },
  ba_tu: { name: 'Bà Tư', avatar: '/npc_avt/ba_tu.png' },
  ba_ngan: { name: 'Bà Ngần', avatar: '/npc_avt/ba_ngan.png' },
  minh: { name: 'Minh', avatar: '/npc_avt/minh.png' },
  hung: { name: 'Hùng', avatar: '/npc_avt/hung.png' },
  sucu: { name: 'Sư Cụ', avatar: null },
}

// Giữ tên cũ để tương thích ngược với chỗ đã import NPCS trước đó.
export const NPCS = CHARACTERS
