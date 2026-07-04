import React, { useRef, useState } from "react";
import Row from "../../components/Row";
import puzzleImage from "../../images/puzzle.png";
import "./style.css";

const storyPuzzles = [
  {
    location: "Tấm bia cũ rêu phong trong chùa",
    lines: [
      "Mỗi tối ta thắp một ngọn đèn",
      "Không dầu, không tim, không ai châm.",
      "Bay giữa đồng mà không cần gió,",
      "Tắt trước bình minh, không ai hay.",
      "Trẻ con chạy theo ta suốt tuổi thơ",
      "Nhưng chưa ai nắm được ta trong tay."
    ],
    question: "Ta là gì?",
    words: ["ĐOM", "ĐÓM"],
    acceptedWords: ["DOM", "DOM"],
    prefilled: [{ wordIndex: 0, letterIndex: 0 }, { wordIndex: 1, letterIndex: 2 }],
    hint: "Có những thứ càng cố nắm càng vụt mất. Cứ để tay mở ra, tự nhiên nó đậu vào.",
    solvedTitle: "Mảnh thứ nhất đã mở khóa",
    answer: "ĐOM ĐÓM"
  },
  {
    location: "Thành giếng cổ, bầu trời phản chiếu ngược",
    lines: [
      "Ta không có địa chỉ mà ai cũng biết đường về,",
      "Ta không có giọng nói mà tiếng ta vang mãi trong lòng người.",
      "Càng đi xa ta, lòng càng thấy nặng,",
      "Nhắm mắt lại, ta hiện ra rõ hơn khi mở mắt nhìn.",
      "Người ta có thể rời ta nhiều năm",
      "Nhưng chưa ai thật sự bỏ ta được."
    ],
    question: "Ta là gì?",
    words: ["QUÊ", "HƯƠNG"],
    acceptedWords: ["QUE", "HUONG"],
    prefilled: [{ wordIndex: 0, letterIndex: 2 }, { wordIndex: 1, letterIndex: 0 }],
    hint: "Bầu trời của chỗ này dù đi đâu cũng vậy, nhưng nhìn từ cái giếng này lại khác.",
    solvedTitle: "Mảnh thứ hai đã mở khóa",
    answer: "QUÊ HƯƠNG"
  },
  {
    location: "Bờ ao lúc chiều tà, mặt nước phẳng lặng",
    lines: [
      "Ta đến không báo trước,",
      "Ta đi không từ biệt.",
      "Người giàu mua không được ta,",
      "Người khôn tìm không ra ta.",
      "Nhưng đứa trẻ chạy trên cỏ ướt",
      "Người già ngồi nhìn khói bếp chiều",
      "Hai người bạn cũ gặp nhau sau nhiều năm,",
      "Ta ở đó, mà không ai nhìn thấy ta."
    ],
    question: "Ta là gì?",
    words: ["NIỀM", "VUI"],
    acceptedWords: ["NIEM", "VUI"],
    prefilled: [{ wordIndex: 0, letterIndex: 1 }, { wordIndex: 1, letterIndex: 0 }],
    hint: "Nó không biết nó đang vui. Nó chỉ đang thả thuyền thôi.",
    solvedTitle: "Mảnh thứ ba đã mở khóa",
    answer: "NIỀM VUI"
  }
];

function normalizeAnswer(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Đ/g, "D")
    .replace(/đ/g, "d")
    .toUpperCase();
}

function createBlankInputs() {
  return storyPuzzles.map((puzzle) =>
    puzzle.words.map((word) => Array.from(word).map(() => ""))
  );
}

function isPrefilled(puzzle, wordIndex, letterIndex) {
  return puzzle.prefilled.some(
    (item) => item.wordIndex === wordIndex && item.letterIndex === letterIndex
  );
}

function CornerFrame() {
  return (
    <>
      <span className="safe-story-corner safe-story-corner-tl"></span>
      <span className="safe-story-corner safe-story-corner-tr"></span>
      <span className="safe-story-corner safe-story-corner-bl"></span>
      <span className="safe-story-corner safe-story-corner-br"></span>
    </>
  );
}

function SafeStoryPuzzle({ onComplete }) {
  const [activePuzzle, setActivePuzzle] = useState(0);
  const [inputs, setInputs] = useState(createBlankInputs);
  const [solved, setSolved] = useState([false, false, false]);
  const [hintVisible, setHintVisible] = useState([false, false, false]);
  const [feedback, setFeedback] = useState(["", "", ""]);
  const inputRefs = useRef({});
  const puzzle = storyPuzzles[activePuzzle];
  const allSolved = solved.every(Boolean);

  function focusBox(puzzleIndex, wordIndex, letterIndex, direction) {
    const editable = [];
    storyPuzzles[puzzleIndex].words.forEach((word, currentWordIndex) => {
      Array.from(word).forEach((_, currentLetterIndex) => {
        if (!isPrefilled(storyPuzzles[puzzleIndex], currentWordIndex, currentLetterIndex)) {
          editable.push(`${puzzleIndex}-${currentWordIndex}-${currentLetterIndex}`);
        }
      });
    });

    const currentKey = `${puzzleIndex}-${wordIndex}-${letterIndex}`;
    const currentIndex = editable.indexOf(currentKey);
    const nextKey = editable[currentIndex + direction];
    if (nextKey && inputRefs.current[nextKey]) {
      inputRefs.current[nextKey].focus();
    }
  }

  function updateInput(puzzleIndex, wordIndex, letterIndex, value) {
    const chars = Array.from(value.normalize("NFC").toUpperCase());
    const nextChar = chars[chars.length - 1];
    if (!nextChar) return;

    setInputs((current) => {
      const next = current.map((puzzleInputs) =>
        puzzleInputs.map((wordInputs) => [...wordInputs])
      );
      next[puzzleIndex][wordIndex][letterIndex] = nextChar;
      return next;
    });
    focusBox(puzzleIndex, wordIndex, letterIndex, 1);
  }

  function handleKeyDown(event, puzzleIndex, wordIndex, letterIndex) {
    if (event.key !== "Backspace" && event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    if (event.key === "ArrowLeft") {
      focusBox(puzzleIndex, wordIndex, letterIndex, -1);
      return;
    }
    if (event.key === "ArrowRight") {
      focusBox(puzzleIndex, wordIndex, letterIndex, 1);
      return;
    }

    const currentValue = inputs[puzzleIndex][wordIndex][letterIndex];
    if (currentValue) {
      setInputs((current) => {
        const next = current.map((puzzleInputs) =>
          puzzleInputs.map((wordInputs) => [...wordInputs])
        );
        next[puzzleIndex][wordIndex][letterIndex] = "";
        return next;
      });
    } else {
      focusBox(puzzleIndex, wordIndex, letterIndex, -1);
    }
  }

  function toggleHint(index) {
    setHintVisible((current) =>
      current.map((visible, visibleIndex) => (visibleIndex === index ? !visible : visible))
    );
  }

  function checkStoryAnswer(index) {
    const target = storyPuzzles[index];
    const correct = target.acceptedWords.every((word, wordIndex) => {
      const typed = Array.from(target.words[wordIndex])
        .map((letter, letterIndex) =>
          isPrefilled(target, wordIndex, letterIndex)
            ? letter
            : inputs[index][wordIndex][letterIndex]
        )
        .join("");
      return normalizeAnswer(typed) === word;
    });

    setFeedback((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? (correct ? "correct" : "wrong") : item))
    );

    window.setTimeout(() => {
      setFeedback((current) => current.map((item, itemIndex) => (itemIndex === index ? "" : item)));
    }, 700);

    if (!correct) return;

    window.setTimeout(() => {
      setSolved((current) => current.map((item, itemIndex) => (itemIndex === index ? true : item)));
      const nextUnsolved = solved.findIndex((item, itemIndex) => !item && itemIndex !== index);
      if (nextUnsolved >= 0) {
        setActivePuzzle(nextUnsolved);
      }
    }, 650);
  }

  function finishStory() {
    try {
      localStorage.setItem("escape-room-story-solved", "true");
    } catch (error) {
      // localStorage can be unavailable in private browsing.
    }
    onComplete();
  }

  if (allSolved) {
    return (
      <div className="safe-story-shell safe-story-ending">
        <div className="safe-story-ending-panel">
          <div className="safe-story-ending-mark">✦ ✦ ✦</div>
          <h2>Ba mảnh đã khớp</h2>
          <p>
            Con đã tìm thấy ĐOM ĐÓM, QUÊ HƯƠNG và NIỀM VUI. Ba thứ đó kỳ thực chỉ
            là một: ký ức đủ sáng để mở cánh cửa cuối cùng.
          </p>
          <button className="safe-story-primary" onClick={finishStory}>
            Mở lối thoát
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="safe-story-shell">
      <div className="safe-story-header">
        <div>
          <span className="safe-story-eyebrow">Vault fragment</span>
          <h1>Hành Trình Đom Đóm</h1>
        </div>
        <div className="safe-story-fragments">
          {storyPuzzles.map((_, index) => (
            <span className={solved[index] ? "safe-story-fragment solved" : "safe-story-fragment"} key={index}>
              {solved[index] ? "✦" : index + 1}
            </span>
          ))}
        </div>
      </div>

      <div className="safe-story-tabs">
        {storyPuzzles.map((item, index) => (
          <button
            className={activePuzzle === index ? "safe-story-tab active" : "safe-story-tab"}
            key={item.answer}
            onClick={() => setActivePuzzle(index)}
          >
            Câu {index + 1}
            {solved[index] ? <span>✦</span> : null}
          </button>
        ))}
      </div>

      <div className={solved[activePuzzle] ? "safe-story-card solved-view" : "safe-story-card"}>
        <CornerFrame />
        {solved[activePuzzle] ? (
          <div className="safe-story-solved">
            <span className="safe-story-solved-icon">✦</span>
            <h2>{puzzle.solvedTitle}</h2>
            <div className="safe-story-answer">{puzzle.answer}</div>
            <p>{puzzle.hint}</p>
          </div>
        ) : (
          <>
            <div className="safe-story-location">{puzzle.location}</div>
            <div className="safe-story-riddle">
              {puzzle.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              <strong>{puzzle.question}</strong>
            </div>

            <div className="safe-story-answer-grid">
              {puzzle.words.map((word, wordIndex) => (
                <React.Fragment key={`${puzzle.answer}-${wordIndex}`}>
                  {wordIndex > 0 ? <span className="safe-story-word-separator"></span> : null}
                  <div className="safe-story-word">
                    {Array.from(word).map((letter, letterIndex) => {
                      const prefilled = isPrefilled(puzzle, wordIndex, letterIndex);
                      const key = `${activePuzzle}-${wordIndex}-${letterIndex}`;
                      return (
                        <label
                          className={
                            "safe-story-letter" +
                            (prefilled ? " prefilled" : "") +
                            (inputs[activePuzzle][wordIndex][letterIndex] ? " filled" : "") +
                            (feedback[activePuzzle] ? ` ${feedback[activePuzzle]}` : "")
                          }
                          key={key}
                        >
                          {prefilled ? (
                            <span>{letter}</span>
                          ) : (
                            <>
                              <input
                                ref={(input) => { inputRefs.current[key] = input; }}
                                value=""
                                maxLength="2"
                                autoComplete="off"
                                aria-label={`Chữ ${letterIndex + 1} của từ ${wordIndex + 1}`}
                                onChange={(event) => updateInput(activePuzzle, wordIndex, letterIndex, event.target.value)}
                                onKeyDown={(event) => handleKeyDown(event, activePuzzle, wordIndex, letterIndex)}
                              />
                              <span>{inputs[activePuzzle][wordIndex][letterIndex]}</span>
                            </>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div className="safe-story-controls">
              <button className="safe-story-secondary" onClick={() => toggleHint(activePuzzle)}>
                Gợi ý
              </button>
              <button className="safe-story-primary" onClick={() => checkStoryAnswer(activePuzzle)}>
                Kiểm tra
              </button>
            </div>

            {hintVisible[activePuzzle] ? (
              <div className="safe-story-hint">{puzzle.hint}</div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function Safe(props) {
  const safePuzzle = props.puzzle[0];
  const [code, setCode] = useState([]);
  const [safeOpened, setSafeOpened] = useState(() => {
    try {
      return localStorage.getItem("escape-room-safe-opened") === "true";
    } catch (error) {
      return false;
    }
  });
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyCompleted, setStoryCompleted] = useState(safePuzzle.isSolved);

  function pickNumber(event) {
    event.preventDefault();
    if (code.length < 4) {
      setCode([...code, event.target.value]);
    }
  }

  function enterCode(event) {
    event.preventDefault();
    if (code.join("") === safePuzzle.winCondition) {
      safeCracked();
    } else {
      setCode([]);
      window.alert("Wrong code, try again!");
    }
  }

  function reset(event) {
    event.preventDefault();
    setCode([]);
  }

  function safeCracked() {
    try {
      localStorage.setItem("escape-room-safe-opened", "true");
    } catch (error) {
      // localStorage can be unavailable in private browsing.
    }
    setSafeOpened(true);
    window.alert("The safe door groans open. Something is hidden inside.");
  }

  function completeStoryPuzzle() {
    setStoryCompleted(true);
    props.handleSolvedPuzzle("0");
    props.onQuestComplete?.();
  }

  if (storyOpen && !storyCompleted) {
    return <SafeStoryPuzzle onComplete={completeStoryPuzzle} />;
  }

  if (storyCompleted || safePuzzle.isSolved) {
    return (
      <div className="safe-complete">
        <div className="safe-complete-panel">
          <h1>The final lock is open.</h1>
          <p>The fragment puzzle revealed the last memory. You can leave the room now.</p>
          <button type="button" onClick={() => props.onQuestComplete?.()} className="safe-result-link">
            View your result
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={safeOpened ? "safe safe-opened" : "safe"}
      style={{
        position: "relative",
      }}
    >
      {safeOpened ? (
        <div className="safe-fragment-stage">
          <div className="safe-fragment-panel">
            <div className="safe-fragment-copy">A torn image waits inside the safe.</div>
            <button className="safe-fragment-button" onClick={() => setStoryOpen(true)}>
              <img src={puzzleImage} alt="Puzzle fragment" />
              <span>Click the fragment</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className="crack"
            style={{
              position: "absolute",
              right: "150px",
              bottom: "1015px"
            }}
          >
            Crack the safe with a 4 digit code!
          </div>
          <div
            className="box"
            style={{
              position: "absolute",
              right: 0,
            }}
          >
            <div className="screen">{code}</div>
            <div className="numPad">
              <Row>
                <button className="num" onClick={pickNumber} value="1">1</button>
                <button className="num" onClick={pickNumber} value="2">2</button>
                <button className="num" onClick={pickNumber} value="3">3</button>
              </Row>
              <Row>
                <button className="num" onClick={pickNumber} value="4">4</button>
                <button className="num" onClick={pickNumber} value="5">5</button>
                <button className="num" onClick={pickNumber} value="6">6</button>
              </Row>
              <Row>
                <button className="num" onClick={pickNumber} value="7">7</button>
                <button className="num" onClick={pickNumber} value="8">8</button>
                <button className="num" onClick={pickNumber} value="9">9</button>
              </Row>
              <Row>
                <button className="enter" onClick={reset}>Reset</button>
                <button className="num" onClick={pickNumber} value="0">0</button>
                <button className="enter" onClick={enterCode} type="submit">Enter</button>
              </Row>
            </div>
            <div
              className="note"
              style={{
                position: "absolute",
                right: 0,
              }}
            >
              <div
                className="postIt"
                style={{
                  position: "absolute",
                  right: "-76px",
                }}
              >
                Dad
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Safe;
