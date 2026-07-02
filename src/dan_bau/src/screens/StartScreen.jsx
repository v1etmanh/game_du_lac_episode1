import { useState, useEffect } from 'react';

const BEST_KEY = 'danbau_best';

export default function StartScreen({ onStart, onTutorial }) {
  const [best] = useState(() => parseInt(localStorage.getItem(BEST_KEY) || '0', 10));
  const [showPlay] = useState(() => Boolean(localStorage.getItem('danbau_seen')));

  useEffect(() => {
    localStorage.setItem('danbau_seen', '1');
  }, []);

  return (
    <div className="screen start-screen">
      {/* Painting fullscreen */}
      <div className="painting-bg full" />

      {/* Frame */}
      <div className="game-frame">
        {/* Top decorative bar */}
        <div className="start-top-bar" />

        {/* Main content container */}
        <div className="start-content">
          {/* Left side decoration */}
          <div className="start-side start-left">
            <div className="side-ornament">✦</div>
            <span className="han-char large">梁祝</span>
            <div className="side-ornament">✦</div>
          </div>

          {/* Center content */}
          <div className="start-center">
            {/* Main title */}
            <div className="start-header">
              <div className="title-glow"></div>
              <h1 className="start-title">ĐÀN BẦU</h1>
              <div className="title-underline"></div>
            </div>

            {/* Subtitle */}
            <div className="start-subtitle">
              <span>Nhạc cụ một dây</span>
              <span className="separator">·</span>
              <span>700 năm lịch sử Việt Nam</span>
            </div>

            {/* Quote section */}
            <div className="start-quote-section">
              <div className="quote-mark">❝</div>
              <em className="start-quote">
                Tiếng đàn bầu của ta<br />
                Cung đàn dân tộc · Lời ca đất nước
              </em>
              <div className="quote-attr">— Nguyễn Đình Thi</div>
            </div>

            {/* Best score if exists */}
            {best > 0 && (
              <div className="start-best-score">
                <div className="best-label">Kỷ Lục Cá Nhân</div>
                <div className="best-value">{best.toLocaleString()}</div>
              </div>
            )}

            {/* Action buttons */}
            <div className="start-buttons">
              <button className="btn-start" onClick={onStart}>
                <span className="btn-text">Bắt Đầu Chơi</span>
                <span className="btn-arrow">→</span>
              </button>

              {showPlay ? (
                <button className="btn-alt" onClick={onStart}>
                  <span className="btn-text">Chơi Lại</span>
                </button>
              ) : (
                <button className="btn-alt" onClick={onTutorial}>
                  <span className="btn-text">Hướng Dẫn</span>
                </button>
              )}
            </div>
          </div>

          {/* Right side decoration */}
          <div className="start-side start-right">
            <div className="side-ornament">✦</div>
            <span className="han-char large">音樂</span>
            <div className="side-ornament">✦</div>
          </div>
        </div>

        {/* Bottom decorative bar */}
        <div className="start-bottom-bar" />
      </div>
    </div>
  );
}
