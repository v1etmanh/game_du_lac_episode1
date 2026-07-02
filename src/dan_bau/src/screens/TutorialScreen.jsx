import { useState, useRef, useEffect, useCallback } from 'react';
import { audioEngine } from '../engine/audioEngine.js';

const STEPS = [
  { id: 1, title: 'Đàn Bầu',       required: false },
  { id: 2, title: 'Gảy Thử',       required: true  },
  { id: 3, title: 'Uốn Tiếng',     required: true  },
  { id: 4, title: 'Thực Hành',     required: false },
];

export default function TutorialScreen({ onFinish, onSkip }) {
  const [step, setStep]         = useState(0);
  const [step2Done, setStep2Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);
  const [flashText, setFlash]   = useState('');
  const [bendPx, setBendPx]     = useState(0);
  const dragRef = useRef({ down: false, startY: 0 });

  // Auto-advance step 1 after 5s
  useEffect(() => {
    if (step !== 0) return;
    const t = setTimeout(() => setStep(1), 5000);
    return () => clearTimeout(t);
  }, [step]);

  // Init audio on first interaction
  useEffect(() => {
    const init = () => audioEngine.init();
    window.addEventListener('keydown', init, { once: true });
    window.addEventListener('mousedown', init, { once: true });
    return () => {
      window.removeEventListener('keydown', init);
      window.removeEventListener('mousedown', init);
    };
  }, []);

  // Keyboard handler
  useEffect(() => {
    const onKey = async (e) => {
      if (e.key.toLowerCase() !== 'a') return;
      if (step !== 1) return;
      await audioEngine.init();
      audioEngine.resume();
      audioEngine.playNote('a', 0);
      setFlash('TUYỆT!');
      setTimeout(() => setFlash(''), 1200);
      setStep2Done(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  const next = useCallback(() => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else onFinish();
  }, [step, onFinish]);

  // Bend drag for step 3
  const onMouseDown = useCallback((e) => {
    dragRef.current = { down: true, startY: e.clientY };
    audioEngine.init().then(() => {
      audioEngine.resume();
      audioEngine.playNote('a', 0, 3);
    });
  }, []);
  const onMouseMove = useCallback((e) => {
    if (!dragRef.current.down || step !== 2) return;
    const dy = dragRef.current.startY - e.clientY;
    setBendPx(dy);
    if (Math.abs(dy) > 25) {
      const semi = (dy / 80) * 1.5;
      audioEngine.setBendAll?.(semi);
      if (!step3Done) {
        setStep3Done(true);
        setFlash('Cảm nhận được chưa?');
        setTimeout(() => setFlash(''), 1500);
      }
    }
  }, [step, step3Done]);
  const onMouseUp = useCallback(() => {
    dragRef.current.down = false;
    setBendPx(0);
    audioEngine.setBendAll?.(0);
  }, []);

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const canAngle = clamp(bendPx / 80, -1, 1) * 22; // degrees

  return (
    <div className="screen tutorial-screen"
      onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      <div className="painting-bg tutorial-blur" />
      <div className="game-frame">

        {/* Step indicators */}
        <div className="step-dots">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
          ))}
        </div>

        {/* Content */}
        <div className="tutorial-card">

          {/* Step 1 — Introduction */}
          {step === 0 && (
            <div className="tutorial-step">
              <div className="tut-icon">🎋</div>
              <div className="tut-title">Đàn Bầu</div>
              <p className="tut-body">
                Nhạc cụ một dây độc đáo của Việt Nam.<br />
                Tiếng đàn tạo ra từ hài âm tự nhiên —<br />
                không phím, không ngăn, chỉ một dây.
              </p>
              <button className="btn-primary" onClick={next}>Tiếp theo →</button>
            </div>
          )}

          {/* Step 2 — Play a note */}
          {step === 1 && (
            <div className="tutorial-step">
              <div className="tut-title">Gảy Thử</div>
              <p className="tut-body">
                Nhấn phím&nbsp;
                <span className="key-badge blink">A</span>
                &nbsp;để gảy dây đàn
              </p>
              <div className="mini-string">
                <div className="mini-node blink" style={{ left: '50%' }} />
              </div>
              {flashText && <div className="tut-flash">{flashText}</div>}
              <p className="tut-hint">✦ Nghe thấy chưa? Tiếng ngân là linh hồn đàn bầu.</p>
              {step2Done && (
                <button className="btn-primary" onClick={next}>Tiếp theo →</button>
              )}
            </div>
          )}

          {/* Step 3 — Pitch bend */}
          {step === 2 && (
            <div className="tutorial-step">
              <div className="tut-title">Uốn Tiếng</div>
              <p className="tut-body">
                Giữ chuột trái và kéo&nbsp;<strong>lên hoặc xuống</strong><br />
                để uốn độ cao tiếng đàn
              </p>
              <div className="can-dan-demo" onMouseDown={onMouseDown}>
                <div className="can-dan-rod"
                  style={{ transform: `rotate(${-45 + canAngle}deg)` }} />
                <div className="can-dan-hint">↑↓ kéo ở đây</div>
              </div>
              <div className="pitch-bar">
                <div className="pitch-fill" style={{ height: `${50 + clamp(bendPx / 2, -45, 45)}%` }} />
              </div>
              {flashText && <div className="tut-flash">{flashText}</div>}
              {step3Done && (
                <button className="btn-primary" onClick={next}>Tiếp theo →</button>
              )}
            </div>
          )}

          {/* Step 4 — Practice */}
          {step === 3 && (
            <div className="tutorial-step">
              <div className="tut-title">Sẵn Sàng!</div>
              <p className="tut-body">
                Gảy đúng lúc nốt đến điểm ○<br />
                Kéo chuột để uốn tiếng sau khi gảy
              </p>
              <div className="controls-summary">
                <div className="ctrl-row">
                  <span className="key-badge">A W E D X Z</span>
                  <span>→ F G A C5 D5 F5</span>
                </div>
                <div className="ctrl-row">
                  <span className="key-badge">🖱 Chuột</span>
                  <span>→ Uốn tiếng</span>
                </div>
              </div>
              <div className="step4-actions">
                <button className="btn-secondary" onClick={onSkip}>Bỏ qua</button>
                <button className="btn-primary" onClick={onFinish}>Sẵn sàng! Bắt đầu →</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
