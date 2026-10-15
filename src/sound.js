// Âm thanh + nhạc nền tạo bằng Web Audio API: không cần file mp3, không cần tải thêm gì.

let ctx = null;
let musicBus = null;
let noiseBuf = null;
let muted = false;

try {
  muted = localStorage.getItem("quiz-muted") === "1";
} catch {
  /* bỏ qua nếu trình duyệt chặn localStorage */
}

export const isMuted = () => muted;

export const setMuted = (value) => {
  muted = value;
  if (value) stopMusic();
  try {
    localStorage.setItem("quiz-muted", value ? "1" : "0");
  } catch {
    /* bỏ qua */
  }
};

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    musicBus = ctx.createGain();
    musicBus.gain.value = 0.4; // nhạc nền nhỏ hơn hiệu ứng để không át tiếng
    musicBus.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// Phát 1 nốt tại thời điểm tuyệt đối "when" (giây, theo đồng hồ của AudioContext)
function voice(freq, when, dur, type, vol, dest, slideTo = null) {
  const c = ctx;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, when + dur);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(vol, when + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(gain).connect(dest);
  osc.start(when);
  osc.stop(when + dur + 0.05);
}

// Hiệu ứng: start = số giây tính từ bây giờ
function tone(freq, start, dur, type = "sine", vol = 0.18, slideTo = null) {
  const c = getCtx();
  if (!c || muted) return;
  voice(freq, c.currentTime + start, dur, type, vol, c.destination, slideTo);
}

// ---------- Hiệu ứng ----------

// Bấm nút thường
export const playClick = () => tone(520, 0, 0.08, "triangle", 0.12);

// Trả lời đúng: 4 nốt đi lên vui tai
export const playCorrect = () => {
  tone(523, 0, 0.14, "square", 0.1);
  tone(659, 0.08, 0.14, "square", 0.1);
  tone(784, 0.16, 0.14, "square", 0.1);
  tone(1047, 0.24, 0.35, "triangle", 0.2);
};

// Trả lời sai: tiếng "bùm" trầm đi xuống
export const playWrong = () => {
  tone(240, 0, 0.35, "sawtooth", 0.12, 110);
};

// Hiển thị từ khóa: chuỗi nốt vang lên
export const playReveal = () => {
  [523, 659, 784, 1047, 1319, 1568].forEach((f, i) =>
    tone(f, i * 0.07, 0.25, "triangle", 0.18),
  );
};

// Kết thúc game: giai điệu chiến thắng
export const playWin = () => {
  const notes = [523, 523, 523, 659, 784, 659, 784, 1047];
  const times = [0, 0.14, 0.28, 0.42, 0.62, 0.82, 1.0, 1.2];
  notes.forEach((f, i) => tone(f, times[i], 0.3, "square", 0.1));
};

// ---------- Nhạc nền ----------

const BPM = 132;
const STEP = 60 / BPM / 4; // mỗi bước = 1 nốt móc kép
const STEPS = 64; // 4 ô nhịp x 16 bước

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

// Chuỗi hợp âm: C - Am - F - G (số MIDI của 3 nốt)
const CHORDS = [
  [48, 52, 55],
  [45, 48, 52],
  [41, 45, 48],
  [43, 47, 50],
];

// Giai điệu 16 bước cho mỗi ô nhịp (chỉ số nốt trong hợp âm, -1 là nghỉ)
const MELODY = [0, -1, 1, 2, -1, 2, 1, -1, 2, 1, 0, -1, 1, 2, 2, 1];
const BASS_STEPS = [0, 3, 6, 8, 11, 14];

function noise() {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

function hat(when, vol, dur = 0.05) {
  const src = ctx.createBufferSource();
  const hp = ctx.createBiquadFilter();
  const g = ctx.createGain();
  src.buffer = noise();
  hp.type = "highpass";
  hp.frequency.value = 7000;
  g.gain.setValueAtTime(vol, when);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  src.connect(hp).connect(g).connect(musicBus);
  src.start(when);
  src.stop(when + dur + 0.02);
}

function clap(when) {
  const src = ctx.createBufferSource();
  const bp = ctx.createBiquadFilter();
  const g = ctx.createGain();
  src.buffer = noise();
  bp.type = "bandpass";
  bp.frequency.value = 1800;
  g.gain.setValueAtTime(0.5, when);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.15);
  src.connect(bp).connect(g).connect(musicBus);
  src.start(when);
  src.stop(when + 0.2);
}

function playStep(step, when) {
  const bar = Math.floor(step / 16);
  const s = step % 16;
  const chord = CHORDS[bar];

  // Trống: kick mỗi nhịp, clap ở nhịp 2 và 4, hi-hat đánh nảy
  if (s % 4 === 0) voice(150, when, 0.18, "sine", 0.9, musicBus, 40);
  if (s === 4 || s === 12) clap(when);
  if (s % 4 === 2) hat(when, 0.35);
  else if (s % 2 === 1) hat(when, 0.1, 0.03);

  // Bass nảy
  if (BASS_STEPS.includes(s)) {
    voice(mtof(chord[0] - 12), when, STEP * 1.8, "sawtooth", 0.2, musicBus);
  }

  // Giai điệu arp
  const idx = MELODY[s];
  if (idx >= 0) {
    voice(mtof(chord[idx] + 24), when, STEP * 1.5, "square", 0.07, musicBus);
  }

  // Hợp âm chạm nhẹ đầu mỗi ô nhịp cho dày
  if (s === 0 || s === 8) {
    chord.forEach((m) =>
      voice(mtof(m + 12), when, STEP * 6, "triangle", 0.09, musicBus),
    );
  }
}

let timer = null;
let nextTime = 0;
let step = 0;

function schedule() {
  if (!ctx) return;
  while (nextTime < ctx.currentTime + 0.2) {
    playStep(step, nextTime);
    nextTime += STEP;
    step = (step + 1) % STEPS;
  }
}

export function startMusic() {
  if (timer || muted) return;
  const c = getCtx();
  if (!c) return;
  nextTime = c.currentTime + 0.05;
  step = 0;
  timer = setInterval(schedule, 50);
}

export function stopMusic() {
  clearInterval(timer);
  timer = null;
}
