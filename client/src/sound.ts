// Sonidos chiptune del juego (muestras aprobadas por Víctor, generadas en
// workspace/quiz-totalsec/audios/). Todo pasa por un interruptor global de
// sonido: los navegadores exigen un gesto del usuario antes de reproducir
// audio, así que la intro intenta arrancar sola y, si el navegador la
// bloquea, arranca con el primer toque o clic en la pantalla.

import introUrl from "./assets/audio-intro.mp3";
import relojUrl from "./assets/audio-reloj.mp3";
import correctaUrl from "./assets/audio-correcta.mp3";
import incorrectaUrl from "./assets/audio-incorrecta.mp3";
import rescateUrl from "./assets/audio-rescate.mp3";
import bonusUrl from "./assets/audio-bonus.mp3";
import fanfarriaUrl from "./assets/audio-intro-fanfarria.mp3";
import historiaUrl from "./assets/audio-intro-historia.mp3";

let enabled = true;
try {
  enabled = localStorage.getItem("qlt-sound") !== "off";
} catch {
  enabled = true;
}
const listeners = new Set<(on: boolean) => void>();

export function soundEnabled(): boolean {
  return enabled;
}

export function setSoundEnabled(on: boolean): void {
  enabled = on;
  try {
    localStorage.setItem("qlt-sound", on ? "on" : "off");
  } catch {
    // sin almacenamiento; el ajuste vive en memoria
  }
  if (!on) stopIntro();
  listeners.forEach((fn) => fn(on));
}

export function onSoundChange(fn: (on: boolean) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function playOnce(url: string, volume = 0.9): void {
  if (!enabled) return;
  try {
    const a = new Audio(url);
    a.volume = volume;
    void a.play().catch(() => {
      // El navegador aún no permite audio; se ignora hasta el primer gesto.
    });
  } catch {
    // Audio no disponible en este entorno.
  }
}

export function playCorrect(): void {
  playOnce(correctaUrl, 0.95);
}

export function playIncorrect(): void {
  playOnce(incorrectaUrl, 0.95);
}

export function playRescueFanfare(): void {
  playOnce(rescateUrl, 0.95);
}

export function playBonusSiren(): void {
  playOnce(bonusUrl, 0.95);
}

// ---------- Audios del intro ----------
// Igual que la música: si el navegador bloquea el audio antes del primer
// gesto (pasa mucho en el explorador de la computadora), el sonido queda
// pendiente y suena con el primer toque o clic, sin perderse.
function playOnceUnlocked(url: string, volume = 1): void {
  if (!enabled) return;
  try {
    const a = new Audio(url);
    a.volume = volume;
    void a.play().catch(() => {
      const retry = () => {
        if (!enabled) return;
        void a.play().catch(() => {
          // Ni con gesto sonó; se deja ir.
        });
      };
      window.addEventListener("pointerdown", retry, { once: true });
    });
  } catch {
    // Audio no disponible en este entorno.
  }
}

export function playIntroFanfare(): void {
  playOnceUnlocked(fanfarriaUrl, 0.95);
}

export function playIntroStory(): void {
  playOnceUnlocked(historiaUrl, 1);
}

// ---------- Confirmación de jugador al unirse ----------
// Cuando un jugador elige nombre y personaje y entra a la sala suena una
// fanfarria corta chiptune (cuatro notas ascendentes generadas con
// WebAudio, sin archivo) y la síntesis de voz del navegador lee su nombre
// en español: «¡<nombre> se une al reto!». Ambas cosas respetan el
// interruptor global de sonido y se invocan desde el clic de «Entrar»,
// que es el gesto que desbloquea el audio.
let audioCtx: AudioContext | null = null;

export function playJoinConfirm(): void {
  if (!enabled) return;
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) {
      playCorrect();
      return;
    }
    audioCtx ??= new Ctor();
    const ac = audioCtx;
    void ac.resume().catch(() => {
      // Si el contexto no arranca, se ignora la fanfarria.
    });
    const t0 = ac.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      const start = t0 + i * 0.09;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.1, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(start);
      osc.stop(start + 0.26);
    });
  } catch {
    playCorrect();
  }
}

export function speakPlayerJoin(name: string): void {
  if (!enabled) return;
  try {
    const clean = name.trim().slice(0, 24);
    if (!clean || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(`¡${clean} se une al reto!`);
    u.lang = "es-MX";
    u.rate = 1.02;
    const es = window.speechSynthesis
      .getVoices()
      .find((v) => v.lang.toLowerCase().startsWith("es"));
    if (es) u.voice = es;
    window.speechSynthesis.speak(u);
  } catch {
    // Sin síntesis de voz disponible en este navegador.
  }
}

export function announcePlayerJoin(name: string): void {
  playJoinConfirm();
  speakPlayerJoin(name);
}

// ---------- Intro en bucle (pantalla inicial) ----------
let introAudio: HTMLAudioElement | null = null;

export function startIntro(): void {
  if (!enabled) return;
  try {
    if (!introAudio) {
      introAudio = new Audio(introUrl);
      introAudio.loop = true;
      introAudio.volume = 0.85;
    }
    if (introAudio.paused) {
      void introAudio.play().catch(() => {
        // Autoplay bloqueado: arrancará con el primer gesto del usuario.
      });
    }
  } catch {
    // Audio no disponible.
  }
}

export function stopIntro(): void {
  try {
    introAudio?.pause();
  } catch {
    // sin audio activo
  }
}

// ---------- Reloj tic-tac durante la pregunta ----------
let tickAudio: HTMLAudioElement | null = null;

export function startTick(): void {
  if (!enabled) return;
  try {
    if (!tickAudio) {
      tickAudio = new Audio(relojUrl);
      tickAudio.loop = true;
      tickAudio.volume = 0.55;
    }
    if (tickAudio.paused) {
      void tickAudio.play().catch(() => {
        // Se ignora hasta que haya un gesto del usuario.
      });
    }
  } catch {
    // Audio no disponible.
  }
}

export function stopTick(): void {
  try {
    tickAudio?.pause();
  } catch {
    // sin audio activo
  }
}
