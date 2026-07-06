function stripHtml(value = '') {
  const div = document.createElement('div');
  div.innerHTML = value;
  return div.textContent || div.innerText || '';
}

function countEvidenceReferences(text, caseFile) {
  const haystack = text.toLowerCase();
  return (caseFile?.evidence || []).filter((item) => {
    const words = (item.text || '').toLowerCase().split(/\s+/).filter((word) => word.length > 4).slice(0, 8);
    return words.some((word) => haystack.includes(word));
  }).length;
}

export function evaluateArticle(draft, caseFile = { evidence: [], contradictions: [], quotes: [] }) {
  const body = Object.values(draft?.texts || {}).map(stripHtml).join('\n');
  const headline = draft?.headline || '';
  const allText = `${headline}\n${body}`;
  const lower = allText.toLowerCase();
  const findings = [];
  let score = 100;

  if (headline.trim().length < 12) {
    score -= 10;
    findings.push({ level: 'warn', text: 'Tieu de con ngan, chua cho thay ai/chuyen gi.' });
  }

  if (/[!?]{2,}|gây sốc|gay soc|sự thật kinh hoàng|su that kinh hoang/i.test(headline)) {
    score -= 16;
    findings.push({ level: 'risk', text: 'Tieu de co dau hieu giat gan, de sai tinh than phong su.' });
  }

  if (!/(ai|ông|ong|bà|ba|anh|chị|chi|làng|lang|xưởng|xuong|nhà|nha|sân|san)/i.test(body)) {
    score -= 12;
    findings.push({ level: 'warn', text: 'Mo bai nen noi ro ai, o dau, chuyen gi.' });
  }

  const evidenceRefs = countEvidenceReferences(allText, caseFile);
  if (evidenceRefs < 2) {
    score -= 20;
    findings.push({ level: 'risk', text: 'Than bai can it nhat 2 bang chung hoac nguon ro rang.' });
  }

  if ((caseFile.contradictions || []).length > 0 && !/theo lời|theo loi|chưa được xác nhận|chua duoc xac nhan|mâu thuẫn|mau thuan/i.test(lower)) {
    score -= 18;
    findings.push({ level: 'risk', text: 'Co mau thuan trong ho so; bai can ghi ro "theo loi ke" hoac "chua duoc xac nhan".' });
  }

  const quoteUsed = (caseFile.quotes || []).some((quote) => lower.includes((quote.text || '').toLowerCase().slice(0, 24)));
  if ((caseFile.quotes || []).length > 0 && !quoteUsed && !/[“"].+[”"]/.test(allText)) {
    score -= 10;
    findings.push({ level: 'warn', text: 'Co cau noi co the trich dan, nhung bai chua dung trich dan ro rang.' });
  }

  if (!/ý nghĩa|y nghia|văn hóa|van hoa|ký ức|ky uc|giữ|giu|truyền|truyen|di sản|di san/i.test(body)) {
    score -= 12;
    findings.push({ level: 'warn', text: 'Ket bai nen rut ra y nghia van hoa, khong chi tom tat su kien.' });
  }

  if (findings.length === 0) {
    findings.push({ level: 'good', text: 'Bai bao co cau truc tot, dung bang chung va giu giong viet co trach nhiem.' });
  }

  return {
    score: Math.max(0, Math.round(score)),
    evidenceRefs,
    findings,
    label: score >= 82 ? 'Vung vang' : score >= 62 ? 'Can sua nhe' : 'Can bien tap lai',
  };
}
