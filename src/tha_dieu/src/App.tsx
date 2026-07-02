import { useEffect, useRef, useState } from "react";
import { Game } from "./engine/Game";
import type { GameSnapshot } from "./engine/types";
import { HUD } from "./ui/HUD";
import { PauseMenu } from "./ui/PauseMenu";

const initialSnapshot: GameSnapshot = {
  windDirectionDegrees: 20,
  windStrength: 0.35,
  ropeLength: 260,
  minRopeLength: 90,
  maxRopeLength: 390,
  distance: 0,
  fps: 60,
  paused: false,
  crashed: false,
  completed: false,
  lives: 3,
  maxLives: 3,
  goalDistance: 800,
};

interface AppProps {
  // Gọi khi người chơi bay đủ khoảng cách mục tiêu và bấm "Quay lại bản đồ".
  // Không truyền thì màn hoàn thành vẫn hiện, chỉ là không có nút thoát.
  onExit?: () => void;
}

export function App({ onExit }: AppProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const [snapshot, setSnapshot] = useState<GameSnapshot>(initialSnapshot);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const game = new Game(canvas, setSnapshot);
    gameRef.current = game;
    game.start();

    return () => {
      game.dispose();
      gameRef.current = null;
    };
  }, []);

  return (
    <main className="game-shell">
      <canvas ref={canvasRef} className="game-canvas" aria-label="Kite side-scrolling game canvas" />
      <HUD snapshot={snapshot} />
      <PauseMenu
        crashed={snapshot.crashed}
        completed={snapshot.completed}
        paused={snapshot.paused}
        distance={snapshot.distance}
        onResume={() => gameRef.current?.setPaused(false)}
        onRestart={() => gameRef.current?.restart()}
        onExit={onExit}
      />
    </main>
  );
}
