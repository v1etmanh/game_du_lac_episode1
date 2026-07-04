import React, { useEffect, useState } from "react";
import Office from "./scenes/Office";
import Bookshelf from "./scenes/Bookshelf";
import Painting from "./scenes/Painting";
import Desk from "./scenes/Desk";
import Safe from "./scenes/Safe";
import ScoreBoard from "./scenes/ScoreBoard";
import Navbar from "./components/Navbar";
import StartPage from "./scenes/StartPage";
import "./App.css";

const puzzleSeed = [
  {
    title: "Safe",
    description: "Enter a 4 digit code to crack the safe and win the game.",
    winCondition: "1219",
    isSolved: false,
  },
  {
    title: "Bookshelf",
    description: "Solve the riddle then select the books that correspond to the answer.",
    winCondition: "day and night",
    isSolved: false,
  },
  {
    title: "Painting",
    description: "Complete the puzzle to put the painting back together",
    winCondition: "solved puzzle",
    isSolved: false,
  },
];

function loadPuzzles() {
  try {
    const storedPuzzles = localStorage.getItem("escape-room-puzzles");
    return storedPuzzles ? JSON.parse(storedPuzzles) : puzzleSeed;
  } catch (error) {
    return puzzleSeed;
  }
}

function App({ startRoute = "office", onExit, onComplete }) {
  const user = { username: "Player", id: "local-player" };
  const [route, setRoute] = useState(startRoute);
  const [puzzles, setPuzzles] = useState(loadPuzzles);

  function handleSolvedPuzzle(puzzleName) {
    const puzzleIndex = Number(puzzleName);
    setPuzzles((currentPuzzles) =>
      currentPuzzles.map((puzzle, index) =>
        index === puzzleIndex ? { ...puzzle, isSolved: true } : puzzle,
      ),
    );
  }

  useEffect(() => {
    localStorage.setItem("escape-room-puzzles", JSON.stringify(puzzles));
  }, [puzzles]);

  const sceneProps = {
    user,
    puzzle: puzzles,
    handleSolvedPuzzle,
    navigate: setRoute,
    onQuestComplete: onComplete,
  };

  function renderScene() {
    if (route === "startPage" || route === "/") {
      return <StartPage {...sceneProps} />;
    }
    if (route === "bookshelf") {
      return <Bookshelf {...sceneProps} />;
    }
    if (route === "painting") {
      return <Painting {...sceneProps} />;
    }
    if (route === "desk") {
      return <Desk {...sceneProps} />;
    }
    if (route === "safe") {
      return <Safe {...sceneProps} />;
    }
    if (route === "scoreBoard") {
      return <ScoreBoard {...sceneProps} />;
    }
    return <Office {...sceneProps} />;
  }

  return (
    <div className="escape-room-embed">
      <Navbar navigate={setRoute} onExit={onExit} />
      {renderScene()}
    </div>
  );
}

export default App;
