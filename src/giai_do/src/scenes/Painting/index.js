import React, { Component } from "react";
import originalImage from "./images/rasterFoxResize.png";
import "./Puzzle.css";

const pieceImages = import.meta.glob("./images/image_part_*.jpg", {
  eager: true,
  import: "default",
});

class Painting extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      pieces: [],
      shuffled: [],
      solved: [],
      winCondition: props.puzzle?.[2]?.isSolved || false,
    };
  }

  componentDidMount() {
    const pieces = [...Array(12)].map((_, i) => ({
      img: `image_part_${`00${i + 1}`.substr(-3)}.jpg`,
      order: i,
      board: "shuffled",
    }));
    this.setState({
      pieces,
      shuffled: this.shuffledPieces(pieces),
      solved: [...Array(12)],
    });
  }

  shuffledPieces = (pieces) => {
    const shuffled = [...pieces];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  displayPiece = (piece, index, boardName) => (
    <li key={index} onDragOver={(event) => event.preventDefault()} onDrop={(event) => this.onDrop(event, index, boardName)}>
      {piece && (
        <img
          draggable
          onDragStart={(event) => this.onDragStart(event, piece.order)}
          src={pieceImages[`./images/${piece.img}`]}
          alt="piece of puzzle"
        />
      )}
    </li>
  );

  onDragStart = (event, order) => {
    event.dataTransfer.setData("text/plain", order);
  };

  onDrop = (event, index, targetName) => {
    const target = [...this.state[targetName]];
    if (target[index]) return;

    const pieceOrder = event.dataTransfer.getData("text/plain");
    const pieceData = this.state.pieces.find((piece) => piece.order === +pieceOrder);
    const origin = [...this.state[pieceData.board]];
    const originIndex = origin.indexOf(pieceData);

    origin[originIndex] = undefined;
    target[index] = { ...pieceData, board: targetName };

    const pieces = this.state.pieces.map((piece) =>
      piece.order === pieceData.order ? { ...piece, board: targetName } : piece,
    );

    this.setState({ pieces, [pieceData.board]: origin, [targetName]: target });
  };

  onClickHandler = () => {
    const isSolved = this.state.solved.every((piece, index) => piece && piece.order === index);

    if (isSolved) {
      window.alert("The painting moved and a safe appeared");
      this.props.handleSolvedPuzzle("2");
      this.setState({
        winCondition: true,
      });
    } else {
      window.alert("Should be some kind of animal, not there yet.");
      this.setState({
        winCondition: false,
      });
    }
  };

  render() {
    return (
      <div className="puzzle">
        <div>
          {this.state.winCondition ? (
            <button type="button" className="btn btn-warning toSafe" onClick={() => this.props.navigate("safe")}>
              Check out the safe
            </button>
          ) : null}
          <div style={{ fontSize: "20px", color: "white", padding: "10px" }}>
            Drag the puzzle pieces to the correct boxes below to solve the puzzle.
          </div>
        </div>
        <ul className="puzzle_shuffled-board">
          {this.state.shuffled.map((piece, i) => this.displayPiece(piece, i, "shuffled"))}
        </ul>
        <ol className="puzzle_solved-board" style={{ backgroundImage: `url(${originalImage})` }}>
          {this.state.solved.map((piece, i) => this.displayPiece(piece, i, "solved"))}
        </ol>
        <div>
          <button type="submit" onClick={this.onClickHandler} className="btn btn-warning">
            Submit
          </button>
        </div>
      </div>
    );
  }
}

export default Painting;
