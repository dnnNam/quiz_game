import { useState, useEffect, useRef } from "react";
import { rounds } from "./data";
import "./App.css";
import Confetti from "./components/Confetti";
import {
  playCorrect,
  playWrong,
  playReveal,
  playWin,
  playClick,
  playStreak,
  playBigWin,
  isMuted,
  setMuted,
  startMusic,
} from "./sound";

const POINTS_CORRECT = 10;
const SPEED_BONUS = 30;

// Chuẩn hóa chuỗi tiếng Việt để so sánh đoán từ khóa
const cleanText = (str) =>
  str
    .trim()
    .toLowerCase()
    .normalize("NFC")
    .replace(/\s+/g, " ");

// Ô chữ bí mật phong cách Gameshow 3D
function KeywordTiles({ word, shown, revealed, highlightAll = false }) {
  const words = word.split(" ");
  let globalCharIdx = 0;

  return (
    <div className="keyword-container" aria-label={revealed ? word : "Từ khóa đang bị ẩn"}>
      {words.map((w, wIdx) => {
        const chars = [...w.normalize("NFC")];
        return (
          <div key={wIdx} className="keyword-word-block">
            {chars.map((char, cIdx) => {
              const currentIdx = globalCharIdx;
              globalCharIdx += 1;
              const isOpen = revealed || highlightAll || shown[currentIdx];

              return (
                <div
                  key={cIdx}
                  className={`key-tile ${isOpen ? "tile-revealed" : "tile-hidden"}`}
                  style={{ animationDelay: `${cIdx * 0.05}s` }}
                >
                  <span className="tile-inner">
                    {isOpen ? char : <span className="tile-placeholder">?</span>}
                  </span>
                  <span className="tile-bevel" />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// Modal hướng dẫn luật chơi cho MC & người chơi
function RulesModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">🎪</span>
            <h3>Luật Chơi & Hướng Dẫn Quản Trò</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="rule-item">
            <div className="rule-badge">1</div>
            <div>
              <strong>Từ khóa bí mật:</strong> Mỗi vòng có 1 từ khóa gồm các ô chữ ẩn dấu hỏi chấm.
            </div>
          </div>
          <div className="rule-item">
            <div className="rule-badge">2</div>
            <div>
              <strong>Trả lời câu hỏi:</strong> Trả lời đúng mỗi câu sẽ lật mở 1 chữ cái tương ứng của từ khóa.
            </div>
          </div>
          <div className="rule-item">
            <div className="rule-badge">3</div>
            <div>
              <strong>Câu hỏi tích điểm:</strong> Các câu hỏi dư tiếp theo giúp tích lũy thêm điểm thưởng!
            </div>
          </div>
          <div className="rule-item">
            <div className="rule-badge">4</div>
            <div>
              <strong>Đoán từ khóa sớm:</strong> Bạn nào xung phong đoán trúng từ khóa trước khi mở hết sẽ nhận thêm tới <strong>+50 điểm Thần Tốc</strong>!
            </div>
          </div>
          <div className="rule-shortcut-box">
            <span className="shortcut-title">⌨️ Phím tắt tiện lợi cho người dẫn trò (MC):</span>
            <div className="shortcut-tags">
              <span><kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> <kbd>D</kbd> hoặc <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd>: Chọn đáp án</span>
              <span><kbd>F</kbd>: Toàn màn hình</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-primary full-width" onClick={onClose}>
            Bắt đầu trò chơi ngay! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal Đoán từ khóa ngay
function GuessModal({ isOpen, onClose, onSubmit, errorMsg }) {
  const [val, setVal] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!val.trim()) return;
    onSubmit(val);
  };

  const handleClose = () => {
    setVal("");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-card guess-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">🎯</span>
            <h3>Đoán Từ Khóa Ngay</h3>
          </div>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Đóng">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <p className="guess-tip">
            Có bạn nào đã tìm ra từ khóa bí mật? Nhập ngay để nhận điểm thưởng thần tốc!
          </p>
          <div className="guess-input-wrap">
            <input
              ref={inputRef}
              type="text"
              className={`guess-input ${errorMsg ? "input-error" : ""}`}
              placeholder="Nhập từ khóa dự đoán..."
              value={val}
              onChange={(e) => setVal(e.target.value)}
              autoFocus
            />
            {errorMsg && <p className="guess-error-text">⚠️ {errorMsg}</p>}
          </div>
          <div className="guess-modal-actions">
            <button type="button" className="btn-ghost" onClick={handleClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={!val.trim()}>
              Xác nhận đoán ⚡
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Giao diện Vòng chơi Gameshow
function Round({ data, roundNo, total, onNextRound, onAddScore, onUpdateStreak, isModalOpen }) {
  const [results, setResults] = useState(() => data.questions.map(() => null));
  const [revealed, setRevealed] = useState(false);
  const [earlySolved, setEarlySolved] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [guessError, setGuessError] = useState("");
  const [confettiActive, setConfettiActive] = useState(false);
  const [floatingPoint, setFloatingPoint] = useState(null);

  const letterCount = [...data.keyword.normalize("NFC")].filter((c) => c !== " ").length;
  const currentQIndex = results.findIndex((r) => r === null);
  const allAnswered = currentQIndex === -1;
  const correctCount = results.filter((r) => r && r.correct).length;

  const shown = Array.from(
    { length: letterCount },
    (_, k) => !!(results[k] && results[k].correct) || revealed || earlySolved
  );

  // Xử lý chọn đáp án
  const handleSelectOption = (optIdx) => {
    if (isChecking || allAnswered || revealed) return;

    setIsChecking(true);
    setSelectedIndex(optIdx);

    const q = data.questions[currentQIndex];
    const isCorrect = optIdx === q.answer;
    const isLetterQ = currentQIndex < letterCount;

    if (isCorrect) {
      playCorrect();
      onAddScore(POINTS_CORRECT);
      onUpdateStreak(true);

      // Hiệu ứng số điểm bay lên
      setFloatingPoint(`+${POINTS_CORRECT}`);
      setTimeout(() => setFloatingPoint(null), 1200);

      setFeedback({
        type: "correct",
        text: isLetterQ
          ? `Chính xác! Chữ cái "${[...data.keyword.normalize("NFC")].filter((c) => c !== " ")[currentQIndex]}" đã được lật mở! 🎉`
          : "Chính xác! Câu hỏi thưởng đã cộng thêm +10 điểm! ⭐",
      });
    } else {
      playWrong();
      onUpdateStreak(false);
      setFeedback({
        type: "wrong",
        text: isLetterQ
          ? "Chưa chính xác! Ô chữ này tạm thời chưa được mở 🔒"
          : "Chưa chính xác! Rất tiếc câu thưởng không ghi điểm.",
      });
    }

    // Sau 1.1 giây chuyển sang câu tiếp theo
    setTimeout(() => {
      setResults((prev) => {
        const next = [...prev];
        next[currentQIndex] = { picked: optIdx, correct: isCorrect };
        return next;
      });
      setSelectedIndex(null);
      setIsChecking(false);
    }, 1150);
  };

  const handleSelectRef = useRef(handleSelectOption);
  useEffect(() => {
    handleSelectRef.current = handleSelectOption;
  });

  // Hỗ trợ phím tắt bàn phím cho MC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isModalOpen || showGuessModal) return;
      const key = e.key.toUpperCase();
      if (!isChecking && !allAnswered && !revealed) {
        if (key === "1" || key === "A") handleSelectRef.current(0);
        else if (key === "2" || key === "B") handleSelectRef.current(1);
        else if (key === "3" || key === "C") handleSelectRef.current(2);
        else if (key === "4" || key === "D") handleSelectRef.current(3);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isChecking, allAnswered, revealed, isModalOpen, showGuessModal]);

  // Xử lý đoán từ khóa trực tiếp
  const handleGuessSubmit = (inputWord) => {
    if (cleanText(inputWord) === cleanText(data.keyword)) {
      playBigWin();
      setConfettiActive(true);
      setShowGuessModal(false);
      setEarlySolved(true);
      setRevealed(true);

      const unansweredCount = results.filter((r) => r === null).length;
      const bonus = unansweredCount * POINTS_CORRECT + SPEED_BONUS;
      onAddScore(bonus);

      setFloatingPoint(`+${bonus} Siêu Thưởng!`);
      setTimeout(() => setFloatingPoint(null), 1600);

      setFeedback({
        type: "correct",
        text: `XUẤT SẮC! Cả đội đã giải mã được từ khóa "${data.keyword}" và nhận thưởng +${bonus} điểm! 🏆`,
      });
    } else {
      playWrong();
      setGuessError("Từ khóa chưa đúng, hãy tiếp tục mở thêm các câu hỏi gợi ý nhé!");
      setTimeout(() => setGuessError(""), 3000);
    }
  };

  // Mở toàn bộ từ khóa
  const handleRevealAll = () => {
    playReveal();
    setRevealed(true);
    setFeedback({
      type: "info",
      text: `Từ khóa chính xác là: "${data.keyword}"`,
    });
  };

  const isLastRound = roundNo === total;
  const currentQ = !allAnswered ? data.questions[currentQIndex] : null;

  return (
    <section className="round-section">
      <Confetti active={confettiActive} />

      {/* GAMESHOW ARENA HEADER (Không dùng ảnh, sang trọng & hoành tráng) */}
      <div className="arena-header-card">
        <div className="arena-meta-row">
          <div className="round-stepper-pill">
            <span className="live-indicator" />
            <span className="round-title-text">VÒNG {roundNo} / {total}</span>
          </div>
          <div className="arena-letter-info">
            <span className="letter-badge-icon">🗝️</span>
            <span>{letterCount} chữ cái bí mật</span>
          </div>
        </div>

        <div className="arena-topic-box">
          <span className="topic-kicker">CHỦ ĐỀ VÒNG CHƠI</span>
          <h2 className="arena-topic-name">{data.topic}</h2>
        </div>
      </div>

      {/* SÂN KHẤU Ô CHỮ 3D TẬP TRUNG */}
      <div className="panel keyword-stage-panel">
        <div className="stage-top-bar">
          <div className="stage-label">
            <span className="stage-sparkle">✨</span>
            <span>Ô CHỮ TỪ KHÓA BÍ MẬT</span>
          </div>
          <div className="stage-status-badge">
            Đã mở: <strong>{shown.filter(Boolean).length}/{letterCount}</strong>
          </div>
        </div>

        <KeywordTiles
          word={data.keyword}
          shown={shown}
          revealed={revealed}
          highlightAll={earlySolved}
        />

        {/* Bảng điều khiển từ khóa cho MC và nhóm chơi */}
        {!revealed ? (
          <div className="guess-action-bar">
            <button
              className="btn-guess-early"
              onClick={() => {
                playClick();
                setShowGuessModal(true);
              }}
            >
              <span className="btn-icon-pulse">🎯</span>
              <span>ĐOÁN TỪ KHÓA NGAY <em>(+Thưởng tới +50 điểm)</em></span>
            </button>
            <button
              className="btn-reveal-ghost"
              onClick={handleRevealAll}
              title="Mở toàn bộ từ khóa"
            >
              👁️ Mở từ khóa
            </button>
          </div>
        ) : (
          <div className="keyword-revealed-banner">
            <span className="revealed-tag">ĐÁP ÁN CHÍNH THỨC</span>
            <span className="revealed-word">{data.keyword}</span>
          </div>
        )}
      </div>

      {/* KHUNG CÂU HỎI VÀ 4 PHƯƠNG ÁN (To rõ, dễ nhìn trên màn chiếu) */}
      <div className="panel question-panel">
        <div className="q-progress-header">
          <div className="q-badge-wrap">
            <span className="q-index-badge">
              CÂU HỎI {!allAnswered ? currentQIndex + 1 : data.questions.length} / {data.questions.length}
            </span>
            {!allAnswered && (
              <span className={`q-type-badge ${currentQIndex >= letterCount ? "bonus" : ""}`}>
                {currentQIndex < letterCount
                  ? `🗝️ Mở chữ cái thứ ${currentQIndex + 1}`
                  : "⭐ Câu hỏi cộng điểm thưởng"}
              </span>
            )}
          </div>

          {/* Stepper dạng chấm tròn */}
          <div className="question-stepper">
            {data.questions.map((_, i) => {
              const r = results[i];
              let statusClass = "step-pending";
              if (r) {
                statusClass = r.correct ? "step-ok" : "step-fail";
              } else if (i === currentQIndex) {
                statusClass = "step-current";
              }
              return (
                <div
                  key={i}
                  className={`step-dot ${statusClass} ${i >= letterCount ? "step-bonus" : ""}`}
                  title={`Câu ${i + 1}`}
                >
                  {r ? (r.correct ? "✓" : "✗") : i + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating điểm số bay lên */}
        {floatingPoint && <div className="floating-point-pop">{floatingPoint}</div>}

        {currentQ ? (
          <div className="question-content">
            <h3 className="question-text">{currentQ.q}</h3>

            <div className="options-grid">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedIndex === i;
                const isCorrectAnswer = i === currentQ.answer;

                let stateClass = "";
                if (isChecking) {
                  if (isSelected) {
                    stateClass = isCorrectAnswer ? "opt-correct" : "opt-wrong";
                  } else if (isCorrectAnswer && selectedIndex !== null) {
                    stateClass = "opt-hint-correct";
                  }
                }

                const optLetters = ["A", "B", "C", "D"];

                return (
                  <button
                    key={i}
                    className={`option-btn ${stateClass}`}
                    onClick={() => handleSelectOption(i)}
                    disabled={isChecking}
                  >
                    <span className="option-letter">{optLetters[i]}</span>
                    <span className="option-text">{opt}</span>
                    {isChecking && isSelected && (
                      <span className="option-feedback-icon">
                        {isCorrectAnswer ? "✓" : "✗"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="round-completed-card">
            <div className="completed-icon">🎉</div>
            <h3>Đã hoàn thành toàn bộ câu hỏi vòng này!</h3>
            <p className="completed-desc">
              Bạn và cả nhóm đã trả lời đúng <strong>{correctCount}/{data.questions.length}</strong> câu hỏi.
            </p>
          </div>
        )}

        {/* Thanh thông báo feedback dưới câu hỏi */}
        <div className="feedback-banner-wrap">
          {feedback && (
            <div className={`feedback-toast ${feedback.type}`}>
              <span>{feedback.text}</span>
            </div>
          )}
        </div>

        {/* Nút Vòng tiếp theo khi từ khóa đã mở hoặc hết câu */}
        {(revealed || allAnswered) && (
          <div className="next-round-container">
            <button
              className="btn-primary btn-large btn-glow"
              onClick={() => {
                playClick();
                onNextRound();
              }}
            >
              {isLastRound ? "🏆 Xem Bảng Tổng Kết Trao Giải" : "Vòng Tiếp Theo ➔"}
            </button>
          </div>
        )}
      </div>

      {/* Modal đoán từ khóa */}
      <GuessModal
        isOpen={showGuessModal}
        onClose={() => setShowGuessModal(false)}
        onSubmit={handleGuessSubmit}
        errorMsg={guessError}
      />
    </section>
  );
}

export default function App() {
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [done, setDone] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const [showRules, setShowRules] = useState(false);
  const [confettiWin, setConfettiWin] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) startMusic();
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const handleAddScore = (pts) => {
    setScore((s) => s + pts);
  };

  const handleUpdateStreak = (isCorrect) => {
    setTotalQuestions((prev) => prev + 1);
    if (isCorrect) {
      setTotalCorrect((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        if (next >= 2) playStreak(next);
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const handleNextRound = () => {
    if (roundIdx + 1 >= rounds.length) {
      setDone(true);
      setConfettiWin(true);
      playWin();
    } else {
      setRoundIdx((i) => i + 1);
    }
  };

  const handleRestart = () => {
    playClick();
    setRoundIdx(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalCorrect(0);
    setTotalQuestions(0);
    setDone(false);
    setConfettiWin(false);
  };

  // Đánh giá danh hiệu người chơi
  const getPlayerTitle = () => {
    if (score >= 180) return { title: "Huyền Thoại Trí Tuệ 👑", stars: 3, desc: "Kiến thức uyên bác, trực giác và phán đoán xuất sắc!" };
    if (score >= 130) return { title: "Bậc Thầy Giải Mã 💎", stars: 3, desc: "Khả năng suy luận sắc bén và chuẩn xác của cả đội!" };
    if (score >= 80) return { title: "Nhà Khám Phá Tài Ba 🌟", stars: 2, desc: "Rất am hiểu văn hóa, ẩm thực và danh thắng Việt Nam!" };
    return { title: "Thám Tử Tri Thức 🎯", stars: 1, desc: "Tinh thần đồng đội tuyệt vời, một khởi đầu ấn tượng!" };
  };

  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const playerRank = getPlayerTitle();

  return (
    <div className="app-container" onClick={startMusic}>
      <Confetti active={confettiWin} duration={6000} />

      {/* Top Navigation Bar cao cấp cho Quản trò */}
      <header className="top-navbar">
        <div className="nav-brand">
          <span className="brand-gem">✨</span>
          <div className="brand-text-wrap">
            <h1 className="brand-name">GIẢI MÃ TỪ KHÓA</h1>
            <span className="brand-tagline">Đố Vui Trí Tuệ Sân Khấu</span>
          </div>
        </div>

        <div className="nav-stats-bar">
          {/* Badge Điểm số lớn */}
          <div className="stat-pill score-pill" title="Tổng điểm hiện tại">
            <span className="stat-icon">🏆</span>
            <div className="stat-info">
              <span className="stat-label">TỔNG ĐIỂM</span>
              <span className="stat-val">{score}</span>
            </div>
          </div>

          {/* Badge Combo Streak */}
          {streak > 1 && (
            <div className="stat-pill streak-pill pulse-anim" title="Chuỗi trả lời đúng liên tiếp">
              <span className="stat-icon">🔥</span>
              <div className="stat-info">
                <span className="stat-label">COMBO</span>
                <span className="stat-val">x{streak}</span>
              </div>
            </div>
          )}

          {/* Nút Toàn màn hình khi trình chiếu */}
          <button
            className="nav-btn fs-btn"
            onClick={toggleFullScreen}
            title="Bật / tắt toàn màn hình để chiếu TV hoặc máy chiếu"
          >
            <span className="nav-btn-icon">{isFullscreen ? "🗗" : "⛶"}</span>
            <span className="nav-btn-text">{isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}</span>
          </button>

          {/* Nút Luật chơi */}
          <button
            className="nav-btn"
            onClick={() => {
              playClick();
              setShowRules(true);
            }}
            title="Xem hướng dẫn luật chơi"
          >
            <span className="nav-btn-icon">💡</span>
            <span className="nav-btn-text">Luật chơi</span>
          </button>

          {/* Nút Âm thanh */}
          <button
            className={`nav-btn audio-btn ${muted ? "muted" : ""}`}
            onClick={toggleMute}
            title={muted ? "Bật âm thanh & nhạc nền" : "Tắt âm thanh"}
          >
            <span className="nav-btn-icon">{muted ? "🔇" : "🔊"}</span>
            <span className="nav-btn-text">{muted ? "Tắt tiếng" : "Bật tiếng"}</span>
          </button>
        </div>
      </header>

      {/* Khu vực nội dung trò chơi chính */}
      <main className="main-content">
        {done ? (
          /* MÀN HÌNH TRAO GIẢI TỔNG KẾT */
          <section className="panel victory-panel">
            <div className="victory-crown">🏆</div>
            <div className="victory-stars">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={`star-icon ${i < playerRank.stars ? "star-active" : "star-inactive"}`}
                >
                  ★
                </span>
              ))}
            </div>

            <h2 className="victory-title">XUẤT SẮC HOÀN THÀNH TRÒ CHƠI!</h2>
            <div className="rank-badge">
              <span className="rank-name">{playerRank.title}</span>
              <p className="rank-desc">{playerRank.desc}</p>
            </div>

            <div className="victory-stats-grid">
              <div className="v-stat-card">
                <span className="v-stat-icon">🌟</span>
                <span className="v-stat-num">{score}</span>
                <span className="v-stat-label">Tổng Điểm Số</span>
              </div>
              <div className="v-stat-card">
                <span className="v-stat-icon">🎯</span>
                <span className="v-stat-num">{accuracy}%</span>
                <span className="v-stat-label">Độ Chính Xác</span>
              </div>
              <div className="v-stat-card">
                <span className="v-stat-icon">🔥</span>
                <span className="v-stat-num">{maxStreak}</span>
                <span className="v-stat-label">Chuỗi Combo Dài Nhất</span>
              </div>
              <div className="v-stat-card">
                <span className="v-stat-icon">🗝️</span>
                <span className="v-stat-num">{rounds.length}/{rounds.length}</span>
                <span className="v-stat-label">Từ Khóa Đã Mở</span>
              </div>
            </div>

            <div className="victory-actions">
              <button className="btn-primary btn-large btn-restart" onClick={handleRestart}>
                <span>🔄 Chơi Lại Từ Đầu</span>
              </button>
            </div>
          </section>
        ) : (
          <Round
            key={roundIdx}
            data={rounds[roundIdx]}
            roundNo={roundIdx + 1}
            total={rounds.length}
            onNextRound={handleNextRound}
            onAddScore={handleAddScore}
            onUpdateStreak={handleUpdateStreak}
            isModalOpen={showRules}
          />
        )}
      </main>

      {/* Footer bản quyền */}
      <footer className="app-footer">
        <p>🎮 Trò chơi Giải Mã Từ Khóa • Thiết kế tổ chức hoạt động tập thể & sinh hoạt nhóm vui nhộn</p>
      </footer>

      {/* Modal hướng dẫn luật chơi */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}