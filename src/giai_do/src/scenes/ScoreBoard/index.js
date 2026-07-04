import React from "react";
import beginImage from "../../images/begin.png";
import "./style.css";

function ScoreBoard(props) {
  const escaped = props.puzzle && props.puzzle[0] && props.puzzle[0].isSolved;

  return (
    <main className="result-page">
      <section className="result-hero" aria-label="Escape room result">
        <img className="result-begin-image" src={beginImage} alt="Framed village memory" />
        <div className="result-panel">
          <span className="result-kicker">Final memory</span>
          <h1>{escaped ? "You escaped!" : "The room is still locked"}</h1>
          <p>
            {escaped
              ? "The last fragment points back to the old house. The door is open now."
              : "Solve the safe fragment puzzle before the final memory can open."}
          </p>
        </div>
      </section>
    </main>
  );
}

export default ScoreBoard;
