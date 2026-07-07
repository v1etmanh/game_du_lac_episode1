import { buildCaseProfile, QUESTION_TYPES } from './investigationProfiles.js';

const BAD_FAITH_PATTERNS = [
  /noi doi|lừa|lua|xạo|xao|che giấu|che giau|kể hết|ke het|thú nhận|thu nhan/i,
];

const VAGUE_PATTERNS = [
  /kể hết|ke het|có gì hay|co gi hay|nói đi|noi di|chuyện này sao|chuyen nay sao/i,
];

const TYPE_PATTERNS = {
  timeline: /khi nao|lúc nào|luc nao|trước|truoc|sau|hôm đó|hom do|thời điểm|thoi diem|mốc thời gian|moc thoi gian|cuộc đời|cuoc doi/i,
  emotion: /cảm thấy|cam thay|buồn|buon|vui|sợ|so|nhớ|nho|xúc động|xuc dong|lo/i,
  object_detail: /ở đâu|o dau|vật|vat|đồ|do|chiếc|chiec|cây|cay|đàn|dan|sỏi|soi|gốc|goc|bàn|ban/i,
  compare: /khác với|khac voi|đối chiếu|doi chieu|theo lời|theo loi|hung nói|hung noi|ông nói|ong noi|bà nói|ba noi/i,
  cause: /vì sao|vi sao|tại sao|tai sao|nguyên nhân|nguyen nhan|do đâu|do dau|lý do|ly do|điều gì|dieu gi|đưa .* tới|dua .* toi|đưa .* đến|dua .* den/i,
  consequence: /sau đó|sau do|thay đổi|thay doi|hệ quả|he qua|ảnh hưởng|anh huong/i,
  quote_confirm: /ghi đúng|ghi dung|trích dẫn|trich dan|đưa vào bài|dua vao bai|cháu có thể ghi|chau co the ghi/i,
};

function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function detectTopic(npcData, profile, questionText) {
  const raw = questionText.toLowerCase();
  const normalized = normalizeText(questionText);
  let bestMatch = null;
  const setMatch = (topicId, score) => {
    if (!topicId) return;
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { topicId, score };
    }
  };

  for (const fact of profile.coreFacts) {
    let score = 0;
    for (const keyword of fact.keywords || []) {
      const rawKeyword = keyword.toLowerCase();
      const normalizedKeyword = normalizeText(keyword);
      if (!normalizedKeyword) continue;

      const matched = raw.includes(rawKeyword) || normalized.includes(normalizedKeyword);
      if (!matched) continue;

      const wordCount = normalizedKeyword.split(' ').length;
      const specificity = wordCount * 8 + Math.min(normalizedKeyword.length, 24);
      const broadPenalty = wordCount === 1 && normalizedKeyword.length <= 4 ? 12 : 0;
      score += specificity - broadPenalty;
    }

    if (score > 0) setMatch(fact.topicId, score);
  }

  const sections = npcData?.notebook?.sections || [];
  for (const section of sections) {
    const label = normalizeText(section.label);
    if (label && normalized.includes(label)) {
      setMatch(section.id, 40 + Math.min(label.length, 30));
    }
  }

  const personalCause = /(dieu gi|ly do|vi sao|tai sao|nguyen nhan|do dau)/.test(normalized)
    && /(dua|den voi|toi voi|bat dau|hoc|chon)/.test(normalized);
  if (personalCause && profile.coreFacts.some((item) => item.topicId === 'memories')) {
    setMatch('memories', 76);
  }

  const personalMemory = /(cuoc doi|doi ba|doi ong|doi anh|ky uc|ky niem|moc thoi gian|thoi gian nao|ngay xua|hoi nho|qua khu)/.test(normalized);
  if (personalMemory && profile.coreFacts.some((item) => item.topicId === 'memories')) {
    setMatch('memories', 82);
  }

  return bestMatch?.topicId || null;
}

export function classifyQuestion(questionText, context = {}) {
  const trimmed = questionText.trim();
  const normalized = normalizeText(trimmed);
  const forcedType = context.forcedType;
  let type = forcedType || 'open';

  if (!forcedType) {
    for (const [candidate, pattern] of Object.entries(TYPE_PATTERNS)) {
      if (pattern.test(trimmed) || pattern.test(normalized)) {
        type = candidate;
        break;
      }
    }
    if (TYPE_PATTERNS.cause.test(trimmed) || TYPE_PATTERNS.cause.test(normalized)) {
      type = 'cause';
    }
    if (TYPE_PATTERNS.timeline.test(trimmed) || TYPE_PATTERNS.timeline.test(normalized)) {
      type = 'timeline';
    }
  }

  const wordCount = normalized ? normalized.split(' ').length : 0;
  const specificitySignals = [
    /\d/.test(trimmed),
    /ông|ong|bà|ba|anh|chị|chi|hung|long|đàn|dan|sỏi|soi|gốc|goc|lễ|le/i.test(normalized),
    /trước|truoc|sau|hôm|hom|lúc|luc|đâu|dau/i.test(normalized),
  ].filter(Boolean).length;
  const vague = VAGUE_PATTERNS.some((pattern) => pattern.test(normalized));
  const pressure = BAD_FAITH_PATTERNS.some((pattern) => pattern.test(normalized));

  return {
    type,
    wordCount,
    specificity: clamp((wordCount - 4) / 11 + specificitySignals * 0.18 - (vague ? 0.35 : 0), 0, 1),
    respect: clamp(pressure ? 0.18 : 0.72 + (type === 'emotion' || type === 'quote_confirm' ? 0.16 : 0), 0, 1),
    isVague: vague || wordCount <= 3,
    isPressure: pressure,
    normalized,
  };
}

function scoreQuestion(analysis, state, topicId) {
  const sameTopicFollowUp = topicId && state.lastTopicId === topicId;
  const repeat = state.askedQuestions.some((item) => {
    if (item.topicId !== topicId || item.type !== analysis.type) return false;
    return item.normalized === analysis.normalized || item.normalized.includes(analysis.normalized) || analysis.normalized.includes(item.normalized);
  });

  let score = 34;
  score += analysis.specificity * 24;
  score += analysis.respect * 22;
  if (sameTopicFollowUp) score += 12;
  if (['compare', 'quote_confirm', 'object_detail'].includes(analysis.type)) score += 8;
  if (analysis.isVague) score -= 20;
  if (analysis.isPressure) score -= 28;
  if (repeat) score -= 18;

  return {
    value: Math.round(clamp(score, 0, 100)),
    repeat,
    sameTopicFollowUp,
  };
}

export function createInitialInterviewState(npcData) {
  const profile = buildCaseProfile(npcData);
  const openness = Object.fromEntries(profile.coreFacts.map((fact) => [fact.topicId, 0]));
  const depth = Object.fromEntries(profile.coreFacts.map((fact) => [fact.topicId, 0]));
  const verification = Object.fromEntries(profile.coreFacts.map((fact) => [fact.topicId, 0]));

  return {
    trust: 50,
    ethics: 78,
    topicOpenness: openness,
    depth,
    verification,
    askedQuestions: [],
    discoveredInfoIds: [],
    lastTopicId: null,
    emotionalState: 'neutral',
    lastQuestionScore: null,
    readyToWrite: false,
    profile,
  };
}

export function createInitialCaseFile(npcData) {
  const profile = buildCaseProfile(npcData);
  return {
    evidence: profile.observations.map((item) => ({
      ...item,
      kind: 'observation',
      source: 'Quan sat',
      status: item.reliability || 'one_source',
      topicId: item.topicId,
    })),
    claims: [],
    contradictions: [],
    quotes: [],
  };
}

function addEvidence(caseFile, items) {
  return {
    ...caseFile,
    evidence: uniqueById([
      ...caseFile.evidence,
      ...items.map((item) => ({
        ...item,
        kind: item.kind || 'testimony',
        source: item.source || 'Loi ke NPC',
        status: item.reliability || 'unverified',
      })),
    ]),
  };
}

function updateVerification(nextState, topicId, caseFile) {
  if (!topicId) return;
  const topicEvidence = caseFile.evidence.filter((item) => item.topicId === topicId);
  const sources = new Set(topicEvidence.map((item) => item.source || item.kind));
  const hasContradiction = caseFile.contradictions.some((item) => item.topicId === topicId);
  nextState.verification[topicId] = clamp(sources.size * 32 + (hasContradiction ? 18 : 0), 0, 100);
}

function getInterviewAverages(state) {
  const values = (record) => Object.values(record);
  const average = (items) => (items.length ? items.reduce((sum, value) => sum + value, 0) / items.length : 0);
  const openness = average(values(state.topicOpenness));
  const depth = average(values(state.depth));
  const verification = average(values(state.verification));
  return {
    trust: state.trust,
    ethics: state.ethics,
    openness,
    depth,
    verification,
    overall: Math.round((state.trust + state.ethics + openness + depth + verification) / 5),
  };
}

function buildNpcText(npcData, fact, hidden, contradiction, analysis, score, state) {
  if (analysis.isPressure && state.trust < 64) {
    return `Cau nay hoi hoi gap qua. ${npcData.name} im mot chut roi chi noi phan chac chan: ${fact?.summary || 'chuyen nay can hoi tu ton hon roi moi ke tiep duoc.'}`;
  }

  if (score.repeat) {
    return `Chau vua hoi gan y nay roi. ${npcData.name} nhac lai ngan gon: ${fact?.summary || 'y do chua co them gi moi.'}`;
  }

  if (hidden?.quote && analysis.type === 'quote_confirm') {
    return `${hidden.text} ${hidden.quote} Chau co the ghi cau nay, mien la dung y va dung boi canh.`;
  }

  if (hidden) {
    return `${fact?.summary || ''} Noi ky hon thi: ${hidden.text}${hidden.quote ? ` ${hidden.quote}` : ''}`;
  }

  if (contradiction && analysis.type === 'compare') {
    return `${fact?.summary || ''} Nhung cho nay can ghi can than: ${contradiction.text}`;
  }

  if (analysis.isVague) {
    return `${npcData.name} ke mot phan chung truoc: ${fact?.summary || fact?.text || 'chuyen nay rong qua, chau hoi cu the hon thi se de nho hon.'}`;
  }

  return fact?.text || `${npcData.name} chua chac ve cau nay, nhung san sang noi them neu chau hoi cu the hon.`;
}

function canRevealHidden(hidden, analysis, state, caseFile) {
  if (!hidden.questionTypes?.includes(analysis.type)) return false;
  if (state.trust < (hidden.minTrust || 0)) return false;
  if (hidden.evidenceRequired?.some((id) => !caseFile.evidence.some((item) => item.id === id))) return false;
  return true;
}

export function runInterviewTurn(npcData, state, caseFile, questionText, options = {}) {
  const profile = state.profile || buildCaseProfile(npcData);
  const analysis = classifyQuestion(questionText, options);
  const topicId = detectTopic(npcData, profile, questionText) || state.lastTopicId || profile.coreFacts[0]?.topicId;
  const fact = profile.coreFacts.find((item) => item.topicId === topicId) || profile.coreFacts[0];
  const scored = scoreQuestion(analysis, state, topicId);
  const nextState = {
    ...state,
    profile,
    topicOpenness: { ...state.topicOpenness },
    depth: { ...state.depth },
    verification: { ...state.verification },
    askedQuestions: [
      ...state.askedQuestions,
      { normalized: analysis.normalized, type: analysis.type, topicId, score: scored.value },
    ],
    lastTopicId: topicId,
    lastQuestionScore: scored.value,
  };

  nextState.trust = clamp(nextState.trust + (analysis.respect > 0.65 ? 4 : -10) + (scored.sameTopicFollowUp ? 2 : 0) - (scored.repeat ? 4 : 0), 0, 100);
  nextState.ethics = clamp(nextState.ethics + (analysis.isPressure ? -14 : analysis.respect > 0.82 ? 3 : 0), 0, 100);
  nextState.topicOpenness[topicId] = clamp((nextState.topicOpenness[topicId] || 0) + (analysis.isVague ? 9 : 22), 0, 100);
  nextState.depth[topicId] = clamp((nextState.depth[topicId] || 0) + (analysis.specificity * 22) + (scored.sameTopicFollowUp ? 10 : 0), 0, 100);
  if (analysis.type === 'emotion') nextState.emotionalState = 'moved';

  let nextCaseFile = caseFile;
  const discovered = [];

  if (fact && !caseFile.claims.some((item) => item.id === fact.id)) {
    discovered.push({
      id: fact.id,
      topicId: fact.topicId,
      kind: 'testimony',
      text: fact.summary,
      source: npcData.name,
      reliability: 'one_source',
      sensitivity: fact.sensitivity,
    });
    nextCaseFile = {
      ...nextCaseFile,
      claims: [...nextCaseFile.claims, fact],
    };
  }

  const hidden = profile.hiddenDetails.find((item) => item.topicId === topicId && canRevealHidden(item, analysis, nextState, nextCaseFile));
  if (hidden && !nextState.discoveredInfoIds.includes(hidden.id)) {
    discovered.push({
      ...hidden,
      kind: 'hidden_detail',
      source: npcData.name,
      status: hidden.reliability,
    });
    nextState.discoveredInfoIds = [...nextState.discoveredInfoIds, hidden.id];
    if (hidden.quote) {
      nextCaseFile = {
        ...nextCaseFile,
        quotes: uniqueById([
          ...nextCaseFile.quotes,
          { id: `quote-${hidden.id}`, topicId, text: hidden.quote, source: npcData.name, status: 'quotable' },
        ]),
      };
    }
  }

  const contradiction = profile.contradictions.find((item) => item.topicId === topicId);
  if (contradiction && ['compare', 'timeline', 'object_detail'].includes(analysis.type)) {
    nextCaseFile = {
      ...nextCaseFile,
      contradictions: uniqueById([...nextCaseFile.contradictions, { ...contradiction, status: 'contradiction' }]),
    };
  }

  if (discovered.length > 0) {
    nextCaseFile = addEvidence(nextCaseFile, discovered);
  }

  updateVerification(nextState, topicId, nextCaseFile);
  const averages = getInterviewAverages(nextState);
  nextState.readyToWrite = averages.overall >= 58 && nextCaseFile.evidence.length >= 3 && (nextCaseFile.quotes.length > 0 || nextCaseFile.contradictions.length > 0);

  const responseText = buildNpcText(npcData, fact, hidden, contradiction, analysis, scored, nextState);
  const unlock = fact?.unlock || [];

  return {
    nextState,
    nextCaseFile,
    response: {
      text: responseText,
      unlock,
      meta: {
        questionType: analysis.type,
        score: scored.value,
        repeat: scored.repeat,
        evidenceAdded: discovered.map((item) => item.id),
        tags: [
          scored.value >= 72 ? 'cau hoi hay' : scored.value <= 35 ? 'cau hoi yeu' : 'on',
          hidden ? 'mo chi tiet an' : null,
          contradiction && analysis.type === 'compare' ? 'mau thuan' : null,
          analysis.isPressure ? 'gay ap luc' : null,
        ].filter(Boolean),
      },
    },
  };
}

export function getQuestionTypes() {
  return QUESTION_TYPES;
}

export function summarizeInterview(state, caseFile) {
  const averages = getInterviewAverages(state);
  return {
    ...averages,
    evidenceCount: caseFile.evidence.length,
    contradictionCount: caseFile.contradictions.length,
    quoteCount: caseFile.quotes.length,
    readyToWrite: state.readyToWrite,
  };
}
