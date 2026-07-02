import { useEffect, useState } from 'react';
import { FACTS } from '../constants/facts.js';

const BEST_KEY = 'danbau_best';

function getGrade(accuracy) {
  if (accuracy >= 90) return { grade: 'S', color: '#f0d060' };
  if (accuracy >= 75) return { grade: 'A', color: '#c4953a' };
  if (accuracy >= 55) return { grade: 'B', color: '#d4bc80' };
  return { grade: 'C', color: '#8a7050' };
}

export default function ResultScreen({ stats, onReplay }) {
  const { score = 0, accuracy = 0, hitCount = 0, total = 42, maxStreak = 0 } = stats ?? {};
  const { grade, color } = getGrade(accuracy);
  const [fact]    = useState(() => FACTS[Math.floor(Math.random() * FACTS.length)]);
  const [copied, setCopied]  = useState(false);
  const [isNew] = useState(() => {
    const prev = parseInt(localStorage.getItem(BEST_KEY) || '0', 10);
    return score > prev;
  });

  useEffect(() => {
    if (isNew) {
      localStorage.setItem(BEST_KEY, String(score));
    }
  }, [isNew, score]);

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?score=${score}&grade=${grade}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="screen result-screen">
      <div className="painting-bg result-blur" />
      <div className="game-frame">
        <div className="result-box">
          <div className="result-title">KẾT QUẢ</div>
          <div className="result-song">Bèo Dạt Mây Trôi</div>

          <div className="result-main">
            <div className="grade-box" style={{ color }}>
              {grade}
              {isNew && <span className="new-badge">NEW!</span>}
            </div>
            <div className="result-stats">
              <div className="stat-row">
                <span className="stat-val" style={{ color }}>{score.toLocaleString()}</span>
                <span className="stat-label">điểm</span>
              </div>
              <div className="stat-row">
                <span className="stat-val">{accuracy}%</span>
                <span className="stat-label">độ chính xác</span>
              </div>
              <div className="stat-row">
                <span className="stat-val">{hitCount} / {total}</span>
                <span className="stat-label">nốt hoàn hảo</span>
              </div>
              <div className="stat-row">
                <span className="stat-val">×{maxStreak}</span>
                <span className="stat-label">chuỗi dài nhất</span>
              </div>
            </div>
          </div>

          <div className="result-divider" />

          <div className="fact-box">
            <div className="fact-icon">💡</div>
            <div>
              <div className="fact-title">Bạn có biết? — {fact.title}</div>
              <div className="fact-text">"{fact.text}"</div>
            </div>
          </div>

          <div className="result-actions">
            <button className="btn-primary" onClick={onReplay}>
              Chơi Lại
            </button>
            <button className="btn-secondary" onClick={handleShare}>
              {copied ? '✓ Đã copy link!' : 'Chia Sẻ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
