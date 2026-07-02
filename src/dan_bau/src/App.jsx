import { useState, useCallback } from 'react';
import StartScreen    from './screens/StartScreen.jsx';
import TutorialScreen from './screens/TutorialScreen.jsx';
import GameScreen     from './screens/GameScreen.jsx';
import ResultScreen   from './screens/ResultScreen.jsx';

// Read shared score from URL on first load
function readUrlScore() {
  const p = new URLSearchParams(window.location.search);
  const s = parseInt(p.get('score') || '0', 10);
  const g = p.get('grade') || null;
  return s > 0 ? { score: s, grade: g } : null;
}

export default function App() {
  const [phase, setPhase] = useState('start');
  const [stats, setStats] = useState(readUrlScore);

  const goGame     = useCallback(() => setPhase('game'),     []);
  const goTutorial = useCallback(() => setPhase('tutorial'), []);

  const handleGameEnd = useCallback((s) => {
    setStats(s);
    setPhase('result');
  }, []);

  return (
    <div className="app-root">
      {phase === 'start' && (
        <StartScreen onStart={goGame} onTutorial={goTutorial} />
      )}
      {phase === 'tutorial' && (
        <TutorialScreen onFinish={goGame} onSkip={goGame} />
      )}
      {phase === 'game' && (
        <GameScreen onGameEnd={handleGameEnd} />
      )}
      {phase === 'result' && (
        <ResultScreen stats={stats} onReplay={goGame} />
      )}
    </div>
  );
}
