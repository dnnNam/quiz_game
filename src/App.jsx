import { useState } from "react";
import { rounds } from "./data";
import "./App.css";
import {
  playCorrect,
  playWrong,
  playReveal,
  playWin,
  playClick,
  isMuted,
  setMuted,
  startMusic,
} from "./sound";

const POINTS_CORRECT = 10;

// Mỗi ô chữ: mở khi được trả lời đúng, hoặc khi bấm "Hiển thị từ khóa"
function Keyword({ word, shown, revealed }) {
  let idx = 0;
  return (
    <div className="tiles" aria-label={revealed ? word : "Từ khóa đang bị ẩn"}>
      {[...word.normalize("NFC")].map((ch, i) => {
        if (ch === " ") return <span key={i} className="tile-gap" />;
        const open = revealed || shown[idx];
        idx += 1;
        return (
          <span key={i} className={`tile ${open ? "tile-open" : ""}`}>
            {open ? ch : ""}
          </span>
        );
      })}
    </div>
  );
}

function Round({ data, roundNo, total, onNext }) {
  const [results, setResults] = useState(() => data.questions.map(() => null));
  const [revealed, setRevealed] = useState(false);

  const letterCount = [...data.keyword.normalize("NFC")].filter(
    (c) => c !== " ",
  ).length;
  const current = results.findIndex((r) => r === null);
  const allAnswered = current === -1;
  const correctCount = results.filter((r) => r && r.correct).length;

  // shown[k] = true nếu câu k đúng và câu k ứng với 1 ký tự
  const shown = Array.from(
    { length: letterCount },
    (_, k) => !!(results[k] && results[k].correct),
  );

  const pick = (i) => {
    const q = data.questions[current];
    if (i === q.answer) playCorrect();
    else playWrong();
    setResults((prev) => {
      const next = [...prev];
      next[current] = { picked: i, correct: i === q.answer };
      return next;
    });
  };

  const isLast = roundNo === total;
  const q = !allAnswered ? data.questions[current] : null;
  const lastIdx = allAnswered ? results.length - 1 : current - 1;
  const lastResult = lastIdx >= 0 ? results[lastIdx] : null;
  const lastGaveLetter =
    lastResult && lastResult.correct && lastIdx < letterCount;

  return (
    <section className="round">
      <header className="round-head">
        <p className="topic">
          Vòng {roundNo}/{total} – chủ đề: {data.topic}
        </p>
        <Keyword word={data.keyword} shown={shown} revealed={revealed} />
      </header>

      <div className="panel qpanel">
        <h2>Câu hỏi</h2>
        <div className="chips" aria-hidden="true">
          {results.map((r, i) => (
            <span
              key={i}
              className={`chip ${r ? (r.correct ? "chip-ok" : "chip-bad") : i === current ? "chip-now" : ""} ${i >= letterCount ? "chip-extra" : ""}`}
            >
              {i + 1}
            </span>
          ))}
        </div>

        {q ? (
          <>
            <p className="question">
              <span className="qno">
                {current + 1}/{data.questions.length}
              </span>
              {q.q}
            </p>
            <div className="options">
              {q.options.map((opt, i) => (
                <button key={i} className="option" onClick={() => pick(i)}>
                  {opt}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="muted">
            Đã hết câu hỏi. Bạn trả lời đúng {correctCount}/
            {data.questions.length} câu.
          </p>
        )}

        <div className="status">
          {lastResult && (
            <p
              className={lastResult.correct ? "msg ok" : "msg bad"}
              role="status"
            >
              {lastResult.correct
                ? lastGaveLetter
                  ? "Chính xác! Một ký tự đã được mở."
                  : "Chính xác! Câu dư này được cộng điểm."
                : lastIdx < letterCount
                  ? "Chưa đúng, ký tự này vẫn bị ẩn."
                  : "Chưa đúng."}
            </p>
          )}
        </div>
      </div>

      <div className="panel guess">
        {!revealed ? (
          <div className="win">
            <p className="muted">Đoán ra từ khóa rồi? Bấm nút để kiểm tra.</p>
            <button
              className="primary big"
              onClick={() => {
                playReveal();
                setRevealed(true);
              }}
            >
              Hiển thị từ khóa
            </button>
          </div>
        ) : (
          <div className="win">
            <p className="answer">{data.keyword}</p>
            <button
              className="primary big"
              onClick={() => {
                playClick();
                onNext(correctCount * POINTS_CORRECT);
              }}
            >
              {isLast ? "Xem kết quả" : "Vòng tiếp theo"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [muted, setMutedState] = useState(isMuted());

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) startMusic();
  };

  const handleNext = (points) => {
    setScore((s) => s + points);
    if (roundIdx + 1 >= rounds.length) {
      setDone(true);
      playWin();
    } else {
      setRoundIdx((i) => i + 1);
    }
  };

  const restart = () => {
    playClick();
    setRoundIdx(0);
    setScore(0);
    setDone(false);
  };

  return (
    <main className="app" onClick={startMusic}>
      <h1 className="title">Giải mã từ khóa</h1>
      <button className="mute" onClick={toggleMute}>
        {muted ? "🔇 Bật âm thanh" : "🔊 Tắt âm thanh"}
      </button>
      <p className="score">Điểm: {score}</p>

      {done ? (
        <section className="panel end">
          <h2>Hoàn thành!</h2>
          <p className="final">{score} điểm</p>
          <button className="primary big" onClick={restart}>
            Chơi lại
          </button>
        </section>
      ) : (
        <Round
          key={roundIdx}
          data={rounds[roundIdx]}
          roundNo={roundIdx + 1}
          total={rounds.length}
          onNext={handleNext}
        />
      )}
    </main>
  );
}
