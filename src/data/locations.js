// Danh sách địa điểm hiển thị trên bản đồ "Chọn địa điểm".
// image: ảnh minh hoạ nhỏ trên thẻ, lấy từ public/landscape
// npc: id nhân vật NPC sẽ nói chuyện trước khi vào minigame (null = không có dialog, vào thẳng puzzle)
// unlocked: trạng thái mở khoá ban đầu (sẽ được cập nhật bởi tiến trình chơi sau này)

export const LOCATIONS = [
  {
    id: 'cong_lang',
    name: 'Cổng làng',
    description: 'Nơi bắt đầu những chuyến phiêu lưu.',
    image: '/landscape/cong_lang.png',
    npc: 'gialang',
    unlocked: true,
    completed: true,
  },
  {
    id: 'vuon_cay',
    name: 'Vườn cây ăn quả',
    description: 'Khu vườn trĩu quả và những trò chơi tinh nghịch.',
    image: '/landscape/vuon_cay.png',
    npc: 'bacnongdan',
    unlocked: true,
  },
  {
    id: 'ruong',
    name: 'Diều sáo trên đồng quê',
    description: 'Gió thổi, diều bay trên cánh đồng vàng.',
    image: '/landscape/canh_dong.png',
    npc: null,
    unlocked: true,
  },
  {
    id: 'cho',
    name: 'Chợ',
    description: 'Khu chợ nhỏ nhộn nhịp với nhiều trò chơi dân gian.',
    image: '/landscape/cho.png',
    npc: 'bacnongdan',
    unlocked: false,
  },
  {
    id: 'nha_ba_tu',
    name: 'Nhà bà tư',
    description: 'Những câu chuyện cổ tích và món ăn tuổi thơ.',
    image: '/landscape/nha_ba_tu.png',
    npc: 'ba_tu',
    unlocked: false,
  },
  {
    id: 'nha_ba_ngan',
    name: 'Nhà bà ngần',
    description: 'Những món quà nhỏ và tình cảm ấm áp.',
    image: '/landscape/nha_ba_ngan.png',
    npc: 'ba_ngan',
    unlocked: false,
  },
  {
    id: 'nha_minh',
    name: 'Nhà minh',
    description: 'Ngôi nhà thân yêu, nơi lưu giữ biết bao kỷ niệm.',
    image: '/landscape/nha_minh.png',
    npc: 'minh',
    unlocked: false,
  },
  {
    id: 'nha_hung',
    name: 'Nhà hùng',
    description: 'Nơi những trò nghịch ngợm bắt đầu.',
    image: '/landscape/nha_hung.png',
    npc: 'hung',
    unlocked: false,
  },
  {
    id: 'den_lang',
    name: 'Đền làng',
    description: 'Nơi diễn ra lễ hội và các trò chơi truyền thống.',
    image: '/landscape/den_lang.png',
    npc: 'gialang',
    unlocked: false,
  },
  {
    id: 'nha_cu',
    name: 'nhà cũ',
    description: 'Chốn thanh tịnh và những câu chuyện xưa.',
    image: '/landscape/chua.png',
    npc: null,
    unlocked: false,
  },
 
]

// Lấy thông tin 1 địa điểm theo id
export function getLocationById(id) {
  return LOCATIONS.find((loc) => loc.id === id) || null
}

// Lấy danh sách các địa điểm (có thể unlock all nếu cần)
export function getLocations(unlockAll = false) {
  if (!unlockAll) {
    return LOCATIONS
  }
  
  // Unlock all locations
  return LOCATIONS.map((loc) => ({
    ...loc,
    unlocked: true,
  }))
}
