export type DiscoveryType = 'npc' | 'challenge'

export type JournalEntry = {
  id: string
  title: string
  shortTitle: string
  type: DiscoveryType
  triggerLabel: string
  npcName: string
  location: string
  page: number
  accent: string
  imageTone: string
  stamp: string
  summary: string
  notes: string[]
  sketch: 'danBau' | 'oAnQuan' | 'market' | 'temple' | 'festival' | 'northernLife'
}

export const journalEntries: JournalEntry[] = [
  {
    id: 'dan-bau',
    title: 'Đàn bầu',
    shortTitle: 'Đàn bầu',
    type: 'npc',
    triggerLabel: 'Gặp nghệ nhân đàn bầu',
    npcName: 'Bà Lựu',
    location: 'hiên nhà ven đình',
    page: 0,
    accent: '#9d4f2d',
    imageTone: '#f4c06a',
    stamp: 'Âm thanh',
    summary:
      'Một dây, một cần, một bầu cộng hưởng. Âm đàn ngân dài như lời kể nhỏ về nếp sống Bắc Bộ.',
    notes: [
      'Đàn bầu chỉ có một dây nhưng tạo nhiều cao độ nhờ cần đàn và tay gảy.',
      'Người kể chuyện nói âm đàn thường được dùng để gợi nhớ quê, ruộng đồng và tâm tình.',
      'Ghi chú: lắng nghe độ rung sau mỗi tiếng gảy, vì phần ngân mới là linh hồn của nhạc cụ.',
    ],
    sketch: 'danBau',
  },
  {
    id: 'o-an-quan',
    title: 'Ô ăn quan',
    shortTitle: 'Ô ăn quan',
    type: 'challenge',
    triggerLabel: 'Hoàn thành ván ô ăn quan',
    npcName: 'Bé Mít',
    location: 'sân gạch đầu làng',
    page: 1,
    accent: '#2e6f5e',
    imageTone: '#9cc9a8',
    stamp: 'Trò chơi',
    summary:
      'Những viên sỏi nhỏ đi qua từng ô đất, vừa là trò chơi, vừa là cách trẻ con học đếm và tính đường đi.',
    notes: [
      'Bàn chơi thường được vẽ trực tiếp trên nền đất hoặc sân gạch.',
      'Hai ô quan nằm ở hai đầu, các ô dân nằm dọc hai bên.',
      'Thử thách demo mở khóa trang này khi người chơi thắng hoặc hoàn thành hướng dẫn.',
    ],
    sketch: 'oAnQuan',
  },
  {
    id: 'cho-viet-nam',
    title: 'Chợ Việt Nam',
    shortTitle: 'Chợ Việt',
    type: 'npc',
    triggerLabel: 'Trò chuyện với cô bán hàng',
    npcName: 'Cô Thắm',
    location: 'chợ sớm',
    page: 2,
    accent: '#b6403d',
    imageTone: '#f2a477',
    stamp: 'Sinh hoạt',
    summary:
      'Chợ không chỉ để mua bán. Đó là nơi tin tức, tiếng cười, món ăn và thói quen làng xóm gặp nhau.',
    notes: [
      'Chợ phiên có nhịp riêng: hàng được dọn từ rất sớm, đông nhất vào buổi mai.',
      'Âm thanh mặc cả, tiếng rao và mùi thức ăn tạo thành ký ức rất rõ về nơi chốn.',
      'NPC có thể dùng trang này để mở nhiệm vụ tìm nguyên liệu hoặc nghe câu chuyện dân gian.',
    ],
    sketch: 'market',
  },
  {
    id: 'den-lang',
    title: 'Đền làng',
    shortTitle: 'Đền làng',
    type: 'npc',
    triggerLabel: 'Hỏi cụ từ giữ đền',
    npcName: 'Cụ Từ Nghiêm',
    location: 'cổng đền',
    page: 3,
    accent: '#6e4b8f',
    imageTone: '#c7b1d9',
    stamp: 'Tín ngưỡng',
    summary:
      'Đền là nơi lưu giữ ký ức cộng đồng, thờ người có công và nhắc dân làng về cội nguồn chung.',
    notes: [
      'Không gian đền thường có cổng, sân, hương án và các chi tiết chạm khắc.',
      'Người chơi có thể học cách ứng xử: đi nhẹ, nói khẽ, quan sát trước khi hỏi.',
      'Trang này nên mở sau cuộc trò chuyện về lịch sử làng hoặc nhân vật được thờ.',
    ],
    sketch: 'temple',
  },
  {
    id: 'hoi-lang',
    title: 'Hội làng',
    shortTitle: 'Hội làng',
    type: 'challenge',
    triggerLabel: 'Tham gia trò hội làng',
    npcName: 'Anh Trống',
    location: 'sân đình ngày hội',
    page: 4,
    accent: '#c18727',
    imageTone: '#f0cf6a',
    stamp: 'Lễ hội',
    summary:
      'Hội làng gom mọi người lại bằng tiếng trống, cờ, trò chơi, nghi lễ và bữa chuyện kéo dài cả ngày.',
    notes: [
      'Phần lễ nhắc đến sự biết ơn, phần hội tạo chỗ cho vui chơi và kết nối.',
      'Các thử thách trong game có thể là kéo co, rước cờ, đánh trống hoặc giải câu đố.',
      'Khi hoàn thành thử thách, nhật kí tự dán thêm ảnh hội và một dòng cảm nhận.',
    ],
    sketch: 'festival',
  },
  {
    id: 'mien-bac',
    title: 'Cuộc sống người dân miền Bắc',
    shortTitle: 'Miền Bắc',
    type: 'npc',
    triggerLabel: 'Nghe bác nông dân kể chuyện',
    npcName: 'Bác Hòa',
    location: 'bờ ruộng sau làng',
    page: 5,
    accent: '#3f6b9c',
    imageTone: '#a7c7df',
    stamp: 'Đời sống',
    summary:
      'Nhịp sống miền Bắc trong demo hiện ra qua mái nhà, bờ ruộng, mùa vụ và cách người dân hỏi han nhau.',
    notes: [
      'Cảnh quan quen thuộc gồm ruộng lúa, ao làng, đường gạch, hàng cau và mái ngói.',
      'Quan hệ xóm làng thể hiện qua lời chào, việc giúp nhau và những câu chuyện lúc nghỉ tay.',
      'Trang này phù hợp để mở sau chuỗi nhiệm vụ khám phá đời sống thường ngày.',
    ],
    sketch: 'northernLife',
  },
]
