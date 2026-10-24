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
  playTick,
  playTimeout,
  isMuted,
  setMuted,
  startMusic,
} from "./sound";

const QUESTION_TIME = 30;

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
              <strong>Lật mở chữ cái & Điểm thưởng:</strong> Trả lời đúng mỗi câu sẽ lật mở 1 chữ cái của từ khóa. Từ khóa càng dài, mỗi câu trả lời đúng nhận càng nhiều điểm!
            </div>
          </div>
          <div className="rule-item">
            <div className="rule-badge">3</div>
            <div>
              <strong>Thời gian đếm ngược 30 giây:</strong> Mỗi câu hỏi có 30 giây suy nghĩ. 5 giây cuối sẽ có chuông tích tắc cảnh báo!
            </div>
          </div>
          <div className="rule-item">
            <div className="rule-badge">4</div>
            <div>
              <strong>Hết thời gian (30s):</strong> Nếu hết thời gian 30s mà chưa có đáp án, chữ cái tương ứng sẽ được tự động lật mở. Bấm nút "Câu Hỏi Tiếp Theo" để tiếp tục câu mới!
            </div>
          </div>
          <div className="rule-shortcut-box">
            <span className="shortcut-title">⌨️ Phím tắt tiện lợi cho người dẫn trò (MC):</span>
            <div className="shortcut-tags">
              <span><kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> <kbd>D</kbd> hoặc <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd>: Chọn đáp án</span>
              <span><kbd>Enter</kbd> / <kbd>Space</kbd> / <kbd>→</kbd>: Chuyển câu tiếp theo</span>
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

// Giao diện Vòng chơi Gameshow
function Round({ data, roundNo, total, onNextRound, onAddScore, onUpdateStreak, isModalOpen }) {
  const [results, setResults] = useState(() => data.questions.map(() => null));
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const [floatingPoint, setFloatingPoint] = useState(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);

  const letterCount = [...data.keyword.normalize("NFC")].filter((c) => c !== " ").length;
  // Keyword dài nhiều điểm, keyword ngắn ít điểm: 6 chữ = 60đ, 7 chữ = 70đ, 8 chữ = 80đ
  const pointsPerQuestion = letterCount * 10;

  const allAnswered = currentQIndex >= data.questions.length;
  const currentResult = !allAnswered ? results[currentQIndex] : null;
  const hasAnsweredCurrent = currentResult !== null;
  const correctCount = results.filter((r) => r && r.correct).length;

  const shown = Array.from(
    { length: letterCount },
    (_, k) =>
      revealed ||
      allAnswered ||
      !!(results[k] && (results[k].correct || results[k].timeout))
  );

  // Xử lý khi hết thời gian 30 giây
  const handleTimeout = () => {
    if (hasAnsweredCurrent || allAnswered || revealed) return;

    playTimeout();
    onUpdateStreak(false);

    const isLetterQ = currentQIndex < letterCount;
    const char = isLetterQ
      ? [...data.keyword.normalize("NFC")].filter((c) => c !== " ")[currentQIndex]
      : "";

    setResults((prev) => {
      const next = [...prev];
      next[currentQIndex] = { picked: null, correct: false, timeout: true };
      return next;
    });

    setFeedback({
      type: "timeout",
      text: isLetterQ
        ? `⏰ Hết thời gian (30s)! Chữ cái "${char}" đã được tự động mở.`
        : "⏰ Hết thời gian (30s)! Không có điểm cho câu hỏi này.",
    });
  };

  const handleTimeoutRef = useRef(handleTimeout);
  useEffect(() => {
    handleTimeoutRef.current = handleTimeout;
  });

  // Bộ đếm ngược thời gian 30s
  useEffect(() => {
    if (hasAnsweredCurrent || allAnswered || revealed || isModalOpen) return;

    if (timeLeft <= 0) {
      handleTimeoutRef.current();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        // Phát tiếng tích tắc ở 5 giây cuối
        if (prev <= 6) {
          playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, hasAnsweredCurrent, allAnswered, revealed, isModalOpen]);

  // Xử lý chọn đáp án
  const handleSelectOption = (optIdx) => {
    if (hasAnsweredCurrent || allAnswered || revealed) return;

    const q = data.questions[currentQIndex];
    const isCorrect = optIdx === q.answer;
    const isLetterQ = currentQIndex < letterCount;
    const char = isLetterQ
      ? [...data.keyword.normalize("NFC")].filter((c) => c !== " ")[currentQIndex]
      : "";

    setResults((prev) => {
      const next = [...prev];
      next[currentQIndex] = { picked: optIdx, correct: isCorrect, timeout: false };
      return next;
    });

    if (isCorrect) {
      playCorrect();
      onAddScore(pointsPerQuestion);
      onUpdateStreak(true);

      // Hiệu ứng số điểm bay lên
      setFloatingPoint(`+${pointsPerQuestion}`);
      setTimeout(() => setFloatingPoint(null), 1200);

      setFeedback({
        type: "correct",
        text: isLetterQ
          ? `Chính xác! (+${pointsPerQuestion} điểm) Chữ cái "${char}" đã được lật mở! 🎉`
          : `Chính xác! (+${pointsPerQuestion} điểm) Câu hỏi thưởng ghi điểm thành công! ⭐`,
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
  };

  const handleSelectRef = useRef(handleSelectOption);
  useEffect(() => {
    handleSelectRef.current = handleSelectOption;
  });

  // Chuyển sang câu hỏi tiếp theo do MC hoặc người chơi bấm
  const handleNextQuestion = () => {
    if (allAnswered) return;
    playClick();
    setFeedback(null);
    setTimeLeft(QUESTION_TIME);
    setCurrentQIndex((prev) => prev + 1);
  };

  const handleNextRef = useRef(handleNextQuestion);
  useEffect(() => {
    handleNextRef.current = handleNextQuestion;
  });

  // Hỗ trợ phím tắt bàn phím cho MC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isModalOpen) return;
      const key = e.key;
      const upper = key.toUpperCase();

      if (!hasAnsweredCurrent && !allAnswered && !revealed) {
        if (upper === "1" || upper === "A") handleSelectRef.current(0);
        else if (upper === "2" || upper === "B") handleSelectRef.current(1);
        else if (upper === "3" || upper === "C") handleSelectRef.current(2);
        else if (upper === "4" || upper === "D") handleSelectRef.current(3);
      } else if (hasAnsweredCurrent && !allAnswered && !revealed) {
        if (key === "Enter" || key === " " || key === "ArrowRight") {
          e.preventDefault();
          handleNextRef.current();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasAnsweredCurrent, allAnswered, revealed, isModalOpen]);

  // Mở toàn bộ từ khóa
  const handleRevealAll = () => {
    playReveal();
    setRevealed(true);
    setConfettiActive(true);
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

      {/* GAMESHOW ARENA HEADER */}
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
          highlightAll={revealed || allAnswered}
        />

        {/* Thanh điều khiển từ khóa */}
        {!revealed ? (
          <div className="stage-action-bar">
            <button
              className="btn-reveal-ghost"
              onClick={handleRevealAll}
              title="Mở toàn bộ từ khóa"
            >
              👁️ Mở toàn bộ từ khóa
            </button>
          </div>
        ) : (
          <div className="keyword-revealed-banner">
            <span className="revealed-tag">ĐÁP ÁN CHÍNH THỨC</span>
            <span className="revealed-word">{data.keyword}</span>
          </div>
        )}
      </div>

      {/* KHUNG CÂU HỎI VÀ 4 PHƯƠNG ÁN */}
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
            {!allAnswered && (
              <span className="q-points-badge" title="Điểm thưởng tính theo độ dài từ khóa">
                💎 +{pointsPerQuestion} điểm
              </span>
            )}
          </div>

          {/* Đồng hồ đếm ngược 30 giây */}
          {!allAnswered && !revealed && (
            <div
              className={`question-timer-badge ${
                hasAnsweredCurrent
                  ? "timer-paused"
                  : timeLeft <= 5
                  ? "timer-urgent"
                  : timeLeft <= 10
                  ? "timer-warning"
                  : ""
              }`}
            >
              <div className="timer-icon-wrap">
                <span className="timer-sand">{hasAnsweredCurrent ? "⏹️" : "⏳"}</span>
              </div>
              <div className="timer-text-wrap">
                <span className="timer-digits">
                  {hasAnsweredCurrent && currentResult?.timeout ? "0s" : `${timeLeft}s`}
                </span>
                <span className="timer-label">
                  {hasAnsweredCurrent
                    ? currentResult?.timeout
                      ? "Hết giờ"
                      : "Đã chọn"
                    : "thời gian"}
                </span>
              </div>
            </div>
          )}

          {/* Stepper dạng chấm tròn */}
          <div className="question-stepper">
            {data.questions.map((_, i) => {
              const r = results[i];
              let statusClass = "step-pending";
              if (r) {
                if (r.correct) statusClass = "step-ok";
                else if (r.timeout) statusClass = "step-timeout";
                else statusClass = "step-fail";
              } else if (i === currentQIndex) {
                statusClass = "step-current";
              }
              const isCurrent = i === currentQIndex && !allAnswered;
              return (
                <div
                  key={i}
                  className={`step-dot ${statusClass} ${isCurrent ? "step-current-active" : ""} ${
                    i >= letterCount ? "step-bonus" : ""
                  }`}
                  title={`Câu ${i + 1}`}
                >
                  {r ? (r.correct ? "✓" : r.timeout ? "⏰" : "✗") : i + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Thanh thời gian chạy mượt mà 30s */}
        {!allAnswered && !revealed && (
          <div className="timer-bar-track">
            <div
              className={`timer-bar-fill ${
                hasAnsweredCurrent
                  ? "bar-paused"
                  : timeLeft <= 5
                  ? "bar-urgent"
                  : timeLeft <= 10
                  ? "bar-warning"
                  : ""
              }`}
              style={{ width: `${(timeLeft / QUESTION_TIME) * 100}%` }}
            />
          </div>
        )}

        {/* Floating điểm số bay lên */}
        {floatingPoint && <div className="floating-point-pop">{floatingPoint}</div>}

        {currentQ ? (
          <div className="question-content">
            <h3 className="question-text">{currentQ.q}</h3>

            <div className="options-grid">
              {currentQ.options.map((opt, i) => {
                const isSelected = currentResult ? currentResult.picked === i : false;
                const isCorrectAnswer = i === currentQ.answer;

                let stateClass = "";
                if (hasAnsweredCurrent) {
                  if (isSelected) {
                    stateClass = isCorrectAnswer ? "opt-correct" : "opt-wrong";
                  } else if (isCorrectAnswer) {
                    // Khi chọn sai hoặc khi hết giờ: làm nổi bật đáp án đúng
                    stateClass = "opt-hint-correct";
                  }
                }

                const optLetters = ["A", "B", "C", "D"];

                return (
                  <button
                    key={i}
                    className={`option-btn ${stateClass}`}
                    onClick={() => handleSelectOption(i)}
                    disabled={hasAnsweredCurrent || revealed}
                  >
                    <span className="option-letter">{optLetters[i]}</span>
                    <span className="option-text">{opt}</span>
                    {hasAnsweredCurrent && isSelected && (
                      <span className="option-feedback-icon">
                        {isCorrectAnswer ? "✓" : "✗"}
                      </span>
                    )}
                    {hasAnsweredCurrent && !isSelected && isCorrectAnswer && (
                      <span className="option-feedback-icon correct-hint">✓</span>
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

        {/* Nút Chuyển câu hỏi tiếp theo do MC hoặc người chơi bấm */}
        {hasAnsweredCurrent && !allAnswered && !revealed && (
          <div className="next-question-container">
            <button
              className="btn-next-question btn-glow"
              onClick={handleNextQuestion}
            >
              <span className="btn-next-text">
                {currentQIndex < data.questions.length - 1
                  ? "Câu Hỏi Tiếp Theo ➔"
                  : "Xem Kết Quả Vòng Này ➔"}
              </span>
              <span className="btn-next-hint">⏎ Enter / Space</span>
            </button>
          </div>
        )}

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

  // Đánh giá danh hiệu người chơi theo thang điểm mới
  const getPlayerTitle = () => {
    if (score >= 1800) return { title: "Huyền Thoại Trí Tuệ 👑", stars: 3, desc: "Kiến thức uyên bác, xuất sắc giải mã toàn bộ thử thách!" };
    if (score >= 1200) return { title: "Bậc Thầy Giải Mã 💎", stars: 3, desc: "Khả năng suy luận sắc bén và chuẩn xác của cả đội!" };
    if (score >= 600) return { title: "Nhà Khám Phá Tài Ba 🌟", stars: 2, desc: "Rất am hiểu các kiến thức về dân chủ và kinh tế XHCN!" };
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
