export const LOCATIONS = [
  {
    id: 'cong_lang',
    name: 'Cổng làng',
    description: 'Nơi Tính và Lan Anh bước vào làng để lần theo ký ức cũ.',
    image: '/landscape/cong_lang.png',
    npc: 'gialang',
    unlocked: true,
    completed: false,
  },
  {
    id: 'vuon_cay',
    name: 'Vườn cây ăn quả',
    description: 'Khu vườn đang mùa thu hoạch, nơi hai bạn gặp bác nông dân.',
    image: '/landscape/vuon_cay.png',
    npc: 'bacnongdan',
    unlocked: false,
    completed: false,
  },
  {
    id: 'cho',
    name: 'Chợ làng',
    description: 'Nơi hai bạn thử bán ít trái cây để kiếm tiền đi tiếp.',
    image: '/landscape/cho.png',
    npc: 'bacnongdan',
    unlocked: false,
    completed: false,
  },
  {
    id: 'nha_ba_tu',
    name: 'Nhà bà Tư',
    description: 'Mái nhà yên tĩnh của nghệ nhân đàn bầu và một nỗi buồn cũ.',
    image: '/landscape/nha_ba_tu.png',
    npc: 'ba_tu',
    unlocked: false,
    completed: false,
  },
  {
    id: 'nha_minh',
    name: 'Nhà Minh',
    description: 'Quán nước nhỏ của người bạn cũ, nơi ký ức đom đóm được nhắc lại.',
    image: '/landscape/nha_minh.png',
    npc: 'minh',
    unlocked: false,
    completed: false,
  },
  {
    id: 'ruong',
    name: 'Cánh đồng',
    description: 'Bãi gió rộng nơi trẻ con trong làng thường rủ nhau thả diều.',
    image: '/landscape/canh_dong.png',
    npc: null,
    unlocked: true,
    completed: false,
  },
  {
    id: 'nha_hung',
    name: 'Nhà Hùng',
    description: 'Xưởng đồ mộc tre của người bạn thuở nhỏ của Tính.',
    image: '/landscape/nha_hung.png',
    npc: 'hung',
    unlocked: false,
    completed: false,
  },
  {
    id: 'nha_ba_ngan',
    name: 'Nhà bà Ngần',
    description: 'Nhà của người vú nuôi từng chăm Tính khi còn bé.',
    image: '/landscape/nha_ba_ngan.png',
    npc: 'ba_ngan',
    unlocked: false,
    completed: false,
  },
  {
    id: 'nha_cu',
    name: 'Nhà cũ',
    description: 'Căn nhà vắng có câu đố về đom đóm và ánh lửa hội làng.',
    image: '/landscape/chua.png',
    npc: null,
    unlocked: false,
    completed: false,
  },
  {
    id: 'den_lang',
    name: 'Đền làng',
    description: 'Nơi hội làng nổi lửa và trò ô ăn quan kết lại hành trình.',
    image: '/landscape/den_lang.png',
    npc: 'gialang',
    unlocked: false,
    completed: false,
  },
]

export function getLocationById(id) {
  return LOCATIONS.find((loc) => loc.id === id) || null
}

export function getLocations(unlockAll = false) {
  if (!unlockAll) return LOCATIONS
  return LOCATIONS.map((loc) => ({ ...loc, unlocked: true }))
}
