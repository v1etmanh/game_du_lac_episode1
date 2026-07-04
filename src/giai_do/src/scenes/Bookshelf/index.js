import React from "react";
import blueBookSmall from "./images/blueBookSmall.png";
import brownBookSmall from "./images/brownBookSmall.png";
import dayBookSmall from "./images/dayBookSmall.png";
import grayBookSmall from "./images/grayBookSmall.png";
import greenBookSmall from "./images/greenBookSmall.png";
import nightBookSmall from "./images/nightBookSmall.png";
import pinkBookSmall from "./images/pinkBookSmall.png";
import redBookSmall from "./images/redBookSmall.png";
import bookshelfImage from "./images/bookshelf.jpg";

const books = [
  { id: "red", image: redBookSmall, alt: "Book with triangle symbol" },
  { id: "blue", image: blueBookSmall, alt: "Blue book with wave symbol" },
  { id: "day", image: dayBookSmall, alt: "Book with day symbol", target: "DayAndNight" },
  { id: "green", image: greenBookSmall, alt: "Book with triangle symbol" },
  { id: "pink", image: pinkBookSmall, alt: "Book with triangle symbol" },
  { id: "night", image: nightBookSmall, alt: "Book with night symbol", target: "DayAndNight" },
  { id: "brown", image: brownBookSmall, alt: "Book with triangle symbol" },
  { id: "gray", image: grayBookSmall, alt: "Book with triangle symbol" },
];

export default class BookShelf extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      droppedBooks: [],
      solved: props.puzzle?.[1]?.isSolved || false,
    };
  }

  handleDrop = (event) => {
    event.preventDefault();
    const bookId = event.dataTransfer.getData("text/plain");
    const book = books.find((item) => item.id === bookId);
    if (!book || book.target !== "DayAndNight" || this.state.droppedBooks.includes(bookId)) {
      return;
    }

    const droppedBooks = [...this.state.droppedBooks, bookId];
    const solved = droppedBooks.length >= 2;
    this.setState({ droppedBooks, solved });

    if (solved) {
      this.props.handleSolvedPuzzle("1");
      window.alert("Answer: Day and Night\nYou found a key in one of the books!");
    }
  };

  render() {
    return (
      <div
        className="books"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "15px",
        }}
      >
        <h1 style={{ fontSize: "30px", margin: "15px", color: "white" }}>
          What breaks yet never falls, and what falls yet never breaks?
        </h1>
        <h3 style={{ margin: "15px", color: "white" }}>
          Two books display images corresponding to the riddle's answer. Drag them both onto the bookshelf to solve this puzzle.
        </h3>
        <div className="droppableBooks" style={{ display: "flex" }}>
          {books.map((book) => (
            <img
              key={book.id}
              className="handle"
              src={book.image}
              alt={book.alt}
              draggable={!this.state.droppedBooks.includes(book.id)}
              onDragStart={(event) => event.dataTransfer.setData("text/plain", book.id)}
              style={{
                visibility: this.state.droppedBooks.includes(book.id) ? "hidden" : "visible",
                cursor: "grab",
              }}
            />
          ))}
        </div>

        <div
          className="bookshelfPuzzle"
          onDragOver={(event) => event.preventDefault()}
          onDrop={this.handleDrop}
        >
          <img className="handle" src={bookshelfImage} alt="Bookshelf" />
        </div>

        {this.state.solved ? (
          <button className="btn btn-warning next" type="button" onClick={() => this.props.navigate("office")}>
            Back to office
          </button>
        ) : null}
      </div>
    );
  }
}
