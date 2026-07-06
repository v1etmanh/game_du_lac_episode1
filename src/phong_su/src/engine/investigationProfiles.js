export const QUESTION_TYPES = [
  { id: 'open', label: 'Cau hoi mo', hint: 'Mo chu de va de nhan vat tu ke.' },
  { id: 'timeline', label: 'Moc thoi gian', hint: 'Lam ro truoc, sau, luc nao.' },
  { id: 'emotion', label: 'Cam xuc', hint: 'Hoi ve cam giac va ky uc.' },
  { id: 'object_detail', label: 'Chi tiet vat the', hint: 'Dao vao do vat, vi tri, dau hieu.' },
  { id: 'compare', label: 'Doi chieu', hint: 'So voi loi ke/vat chung khac.' },
  { id: 'cause', label: 'Nguyen nhan', hint: 'Hoi vi sao su viec xay ra.' },
  { id: 'consequence', label: 'He qua', hint: 'Hoi sau do dieu gi thay doi.' },
  { id: 'quote_confirm', label: 'Xac nhan trich dan', hint: 'Xin phep dung cau noi.' },
];

const CASE_PROFILES = {
  ong_ba: {
    observations: [
      {
        id: 'obs-oaq-board-worn',
        topicId: 'materials',
        text: 'San den co vet vach o an quan cu bi xoa roi ke lai nhieu lan, soi quan lon hon soi dan.',
        reliability: 'one_source',
        sensitivity: 'low',
      },
      {
        id: 'obs-oaq-children-phone',
        topicId: 'meaning',
        text: 'Gan san den, tre con bi thu hut boi dien thoai nhieu hon nhung van dung lai khi co nguoi rai soi choi thu.',
        reliability: 'one_source',
        sensitivity: 'medium',
      },
    ],
    hiddenDetails: [
      {
        id: 'hidden-oaq-girl-winner',
        topicId: 'memories',
        questionTypes: ['emotion', 'timeline'],
        minTrust: 56,
        text: 'Ong Gia Lang nho ro nguoi tung thang minh la mot co be nha gan dinh lang, sau nay chinh co ay day lai tro cho dam tre.',
        quote: 'Thua luc do ong xau ho, nhung ve sau moi hieu: tro nay khong chon con trai hay con gai, chi chon nguoi biet tinh.',
        reliability: 'quotable',
        sensitivity: 'medium',
      },
      {
        id: 'hidden-oaq-rule-change',
        topicId: 'rules',
        questionTypes: ['compare', 'object_detail'],
        minTrust: 48,
        evidenceRequired: ['obs-oaq-board-worn'],
        text: 'Cach tinh quan trong lang tung thay doi: co thoi dem quan bang 5 dan, co thoi bang 10 dan tuy le hoi.',
        reliability: 'contradiction',
        sensitivity: 'medium',
      },
    ],
    contradictions: [
      {
        id: 'con-oaq-origin',
        topicId: 'origin',
        text: 'Ong Gia Lang noi tro co tu doi ong noi, nhung khong co bang chung ve moc Hung Vuong.',
        against: 'Cac cau ke dan gian thuong noi tro co tu thoi Hung Vuong.',
      },
    ],
    boundaries: [
      {
        id: 'bound-oaq-phone',
        topicId: 'meaning',
        minTrust: 58,
        text: 'Ong Gia Lang khong muon bi viet thanh nguoi trach moc tre con dung dien thoai.',
      },
    ],
  },
  hung: {
    observations: [
      {
        id: 'obs-hung-root-on-table',
        topicId: 'origin',
        text: 'Tren ban tho co mot goc tre cu duoc dat rieng, khac voi cac tac pham ban hang.',
        reliability: 'one_source',
        sensitivity: 'medium',
      },
      {
        id: 'obs-hung-tool-mark',
        topicId: 'carving',
        text: 'Nhung vet duc tren goc tre khong deu, co vet dung lai giua chung nhu tung do du.',
        reliability: 'one_source',
        sensitivity: 'low',
      },
    ],
    hiddenDetails: [
      {
        id: 'hidden-hung-tinh-note',
        topicId: 'memories',
        questionTypes: ['emotion', 'object_detail'],
        minTrust: 60,
        evidenceRequired: ['obs-hung-root-on-table'],
        text: 'Hung nho ngay nho Tinh thuong gui do cho Ba Ngan giu ho, vi ba tung cham Tinh nhu vu nuoi trong nha.',
        quote: 'Hoi do may hay noi Ba Ngan la nguoi giu ho tuoi tho cua may, vi ba biet may thich gi truoc ca khi may noi ra.',
        reliability: 'quotable',
        sensitivity: 'high',
      },
      {
        id: 'hidden-hung-chemical',
        topicId: 'treatment',
        questionTypes: ['compare', 'cause'],
        minTrust: 52,
        text: 'Hung thua nhan mot vai xuong hien nay dung hoa chat nhanh, trai voi cach ngam bun truyen thong ma anh van co giu.',
        reliability: 'contradiction',
        sensitivity: 'medium',
      },
    ],
    contradictions: [
      {
        id: 'con-hung-treatment',
        topicId: 'treatment',
        text: 'Hung noi cach chuan la ngam bun nhieu thang, nhung cung biet co xuong dung hoa chat de rut ngan thoi gian.',
        against: 'Loi ke ve su thuan truyen thong cua nghe goc tre.',
      },
    ],
    boundaries: [
      {
        id: 'bound-hung-tinh-memory',
        topicId: 'memories',
        minTrust: 62,
        text: 'Chuyen gia dinh va tuoi nho cua Tinh la ranh gioi rieng tu, Hung chi noi neu nguoi hoi that su ton trong.',
      },
    ],
  },
  ba_tu: {
    observations: [
      {
        id: 'obs-danbau-old-gourd',
        topicId: 'structure',
        text: 'Qua bau tren cay dan cua Ba Tu da cu, co vet nut nho nhung van duoc giu nguyen.',
        reliability: 'one_source',
        sensitivity: 'medium',
      },
      {
        id: 'obs-danbau-empty-chair',
        topicId: 'playing',
        text: 'Ben canh cay dan luon co mot chiec ghe go trong, nhu de danh cho nguoi tung ngoi nghe dan.',
        reliability: 'one_source',
        sensitivity: 'medium',
      },
    ],
    hiddenDetails: [
      {
        id: 'hidden-danbau-lost-child',
        topicId: 'memories',
        questionTypes: ['emotion', 'quote_confirm'],
        minTrust: 58,
        text: 'Ba Tu hoc dan sau khi mat con va mat chong, xem moi lan tap la mot cach ngoi lai voi hai nguoi khong con ben minh.',
        quote: 'Ba khong hoc dan de thanh nghe nhan, ba hoc de can nha nay khong im den muc quen mat nguoi da tung o day.',
        reliability: 'quotable',
        sensitivity: 'high',
      },
      {
        id: 'hidden-danbau-husband-song',
        topicId: 'sound',
        questionTypes: ['emotion', 'cause'],
        minTrust: 54,
        evidenceRequired: ['obs-danbau-old-gourd'],
        text: 'Bai Beo dat may troi tung la bai chong Ba Tu dan cho ba nghe moi chieu, nen tieng dan voi ba vua la ky thuat vua la tang vat.',
        reliability: 'one_source',
        sensitivity: 'high',
      },
    ],
    contradictions: [
      {
        id: 'con-danbau-artist',
        topicId: 'memories',
        text: 'Ba Tu duoc goi la nghe nhan, nhung ba nhan minh hoc dan truoc het vi noi buon rieng, khong phai vi danh xung.',
        against: 'Cach goi Ba Tu nhu mot nghe nhan thuan tuy.',
      },
    ],
    boundaries: [
      {
        id: 'bound-danbau-family',
        topicId: 'memories',
        minTrust: 56,
        text: 'Ba Tu khong muon noi mat mat cua minh thanh cau chuyen giat gan hay bi luy.',
      },
    ],
  },
  ba_nam: {
    observations: [],
    hiddenDetails: [],
    contradictions: [],
    boundaries: [],
  },
};

export function buildCaseProfile(npcData) {
  const base = CASE_PROFILES[npcData.id] || {};
  const sections = npcData?.notebook?.sections || [];
  const responseEntries = Object.entries(npcData?.responses || {});

  const coreFacts = responseEntries.map(([id, response]) => ({
    id: `fact-${npcData.id}-${id}`,
    topicId: id,
    type: 'core_fact',
    text: response.text,
    summary: sections.find((section) => section.id === id)?.content || response.text,
    reliability: 'unverified',
    sensitivity: id === 'memories' ? 'medium' : 'low',
    source: npcData.name,
    unlock: response.unlock || [id],
    keywords: response.keywords || [],
    sampleQuestion: response.sampleQuestion,
  }));

  const quotes = coreFacts.map((fact) => ({
    id: `quote-${fact.topicId}`,
    topicId: fact.topicId,
    text: fact.summary,
    source: npcData.name,
    reliability: 'quotable',
    sensitivity: fact.sensitivity,
  }));

  return {
    npcId: npcData.id,
    coreFacts,
    observations: base.observations || [],
    hiddenDetails: base.hiddenDetails || [],
    contradictions: base.contradictions || [],
    boundaries: base.boundaries || [],
    quotes,
  };
}
