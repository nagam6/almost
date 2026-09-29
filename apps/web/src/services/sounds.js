import wrongAnswerUrl from "../../../../docs/sounds/wrong-answer.mp3?url";
let audioCtx = null;

function getContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) audioCtx = new AudioContextClass();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playTone(frequency, start, duration, type = "sine", volume = 0.15) {
  const ctx = getContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const time = ctx.currentTime + start;

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(volume, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(time);
  oscillator.stop(time + duration + 0.05);
}

export function playCorrect() {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return;

  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.type = "sine";
  oscillator.frequency.value = 800;

  gain.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.4
  );

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.4);

  oscillator.onended = () => {
    void audioContext.close();
  };
}


export function playRethink() {
  playTone(330, 0, 0.2, "triangle");
  playTone(262, 0.2, 0.35, "triangle");
}


// AudioContext

let wrongAnswerAudio;

export function playWrong() {
  if (!wrongAnswerAudio) {
    wrongAnswerAudio = new Audio(wrongAnswerUrl);
    wrongAnswerAudio.volume = 0.45;
  }

  wrongAnswerAudio.currentTime = 0;
  void wrongAnswerAudio.play().catch((error) => {
    console.error("Wrong-answer sound could not play:", error);
  });
}