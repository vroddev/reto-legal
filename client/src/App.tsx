import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SafeAreaTopScrim } from "@hatch/space-sdk/client";
import { api, type ApiResponse } from "./api";
import { qrMatrix } from "./qr";
import introPixel from "./assets/intro-total-cyber-sec-pixel.webp";
import introVideo from "./assets/intro-total-cyber-sec-loop.mp4";
import presentadorImg from "./assets/presentador.webp";
import rescateArt from "./assets/rescate-art.webp";
import bonusArt from "./assets/bonus-art.webp";
import avatarHOscuro from "./assets/avatar-h-oscuro.webp";
import avatarMBlazer from "./assets/avatar-m-blazer.webp";
import avatarHLentes from "./assets/avatar-h-lentes.webp";
import avatarMChongo from "./assets/avatar-m-chongo.webp";
import avatarHJoven from "./assets/avatar-h-joven.webp";
import avatarHLentesSol from "./assets/avatar-h-lentes-sol.webp";
import avatarMLentes from "./assets/avatar-m-lentes.webp";
import avatarSinPelo from "./assets/avatar-sin-pelo.webp";
import {
  announcePlayerJoin,
  onSoundChange,
  playBonusSiren,
  playCorrect,
  playIncorrect,
  playIntroFanfare,
  playIntroStory,
  playRescueFanfare,
  setSoundEnabled,
  soundEnabled,
  startIntro,
  startTick,
  stopIntro,
  stopTick,
} from "./sound";

type Room = ApiResponse<typeof api, "getRoom">;
type Player = Room["players"][number];

type Session = {
  role: "host" | "player";
  code: string;
  playerId: number | null;
  localPlayerId: number | null;
};

const LETTERS = ["A", "B", "C", "D"];

const CAT_COLORS: Record<string, string> = {
  "Derecho básico": "#E8490F",
  "Derecho corporativo": "#8A5A2B",
  "Propiedad intelectual": "#C21807",
  Contratos: "#B8860B",
  "Datos personales": "#1E9E4A",
  Ciberseguridad: "#D42A1E",
  "Ingeniería social": "#F97316",
  "Normas ISO": "#5B7A99",
  "Inteligencia artificial": "#7A4FA3",
  "Derecho penal": "#8E2A6E",
  Totalsec: "#E8490F",
  "Pregunta de Rescate": "#F5B301",
  "Bonus divertido": "#F5B301",
};

function catColor(cat: string): string {
  return CAT_COLORS[cat] ?? "#7A6A58";
}

// ---------- Abogados elegibles (8, aprobados por Víctor) ----------
type AvatarId =
  | "h-oscuro"
  | "m-blazer"
  | "h-lentes"
  | "m-chongo"
  | "h-joven"
  | "h-lentes-sol"
  | "m-lentes"
  | "sin-pelo";

const AVATARS: { id: AvatarId; label: string; img: string }[] = [
  { id: "h-oscuro", label: "Abogado · traje oscuro y corbata", img: avatarHOscuro },
  { id: "m-blazer", label: "Abogada · blazer oscuro", img: avatarMBlazer },
  { id: "h-lentes", label: "Abogado · lentes y traje gris", img: avatarHLentes },
  { id: "m-chongo", label: "Abogada · chongo y traje azul marino", img: avatarMChongo },
  { id: "h-joven", label: "Abogado joven · traje oscuro", img: avatarHJoven },
  { id: "h-lentes-sol", label: "Abogado joven · lentes de sol", img: avatarHLentesSol },
  { id: "m-lentes", label: "Abogada · lentes y coleta", img: avatarMLentes },
  { id: "sin-pelo", label: "Abogado · sin pelo, con barba", img: avatarSinPelo },
];

function avatarImg(id: string): string {
  return AVATARS.find((a) => a.id === id)?.img ?? avatarHOscuro;
}

function AvatarImg({
  avatar,
  className = "h-10 w-10",
}: {
  avatar: string;
  className?: string;
}) {
  return (
    <img
      src={avatarImg(avatar)}
      alt=""
      aria-hidden="true"
      className={`pixel-art pixel-frame-sm shrink-0 object-cover object-top ${className}`}
    />
  );
}

function AvatarPicker({
  value,
  onChange,
  name,
}: {
  value: AvatarId;
  onChange: (a: AvatarId) => void;
  name: string;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-sm">Elige tu abogado</legend>
      <div className="grid w-full grid-cols-4 gap-2" role="radiogroup" aria-label="Elige tu abogado">
        {AVATARS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={value === a.id}
            aria-label={a.label}
            title={a.label}
            onClick={() => onChange(a.id)}
            className="pixel-frame-sm w-full min-w-0 overflow-hidden bg-[#e3f2fd] p-0 transition-transform"
            style={
              value === a.id
                ? { outline: "3px solid var(--accent)", outlineOffset: 2, transform: "translateY(-2px)" }
                : { opacity: 0.75 }
            }
          >
            <img src={a.img} alt="" aria-hidden="true" className="pixel-art aspect-[17/16] w-full object-cover object-top" />
          </button>
        ))}
      </div>
      <p className="mt-1 text-sm break-words text-[var(--dim)]">
        {name.trim() ? `${name.trim()} · ` : ""}
        {AVATARS.find((a) => a.id === value)?.label}
      </p>
    </fieldset>
  );
}

// ---------- Pregunta con efecto máquina de escribir ----------
function TypewriterText({ text }: { text: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const t = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(t);
          return c;
        }
        return c + 1;
      });
    }, 24);
    return () => clearInterval(t);
  }, [text]);
  return (
    <>
      {text.slice(0, count)}
      <span className="type-cursor" aria-hidden="true" />
    </>
  );
}

// ---------- Confeti y fuegos artificiales (solo rescate acertado) ----------
const CONFETTI_COLORS = ["#E8490F", "#D42A1E", "#F5B301", "#33302C", "#FF8C42"];

function Celebration() {
  const pieces = Array.from({ length: 42 }, (_, i) => ({
    left: (i * 37) % 100,
    delay: ((i * 13) % 20) / 10,
    dur: 2.4 + ((i * 7) % 14) / 10,
    size: 7 + ((i * 11) % 8),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length] as string,
    round: i % 3 === 0,
  }));
  const rings = [
    { left: "18%", top: "16%", color: "#E8490F", delay: "0s" },
    { left: "68%", top: "10%", color: "#F5B301", delay: "0.35s" },
    { left: "45%", top: "26%", color: "#D42A1E", delay: "0.7s" },
  ];
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.5,
            background: p.color,
            borderRadius: p.round ? "50%" : 1,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
      {rings.map((r, i) => (
        <span
          key={i}
          className="firework-ring"
          style={{
            left: r.left,
            top: r.top,
            width: 130,
            height: 130,
            borderColor: r.color,
            animationDelay: r.delay,
          }}
        />
      ))}
    </div>
  );
}

// ---------- Botón de sonido ----------
function SoundToggle() {
  const [on, setOn] = useState(() => soundEnabled());
  useEffect(() => onSoundChange(setOn), []);
  return (
    <button
      type="button"
      aria-label={on ? "Silenciar los sonidos del juego" : "Activar los sonidos del juego"}
      aria-pressed={on}
      onClick={() => setSoundEnabled(!on)}
      className="pixel-frame-sm bg-[var(--surface)] px-3 py-1.5 text-sm font-bold"
    >
      {on ? "♪ Sonido: SÍ" : "♪ Sonido: NO"}
    </button>
  );
}

// ---------- Efectos de sonido según la fase del juego ----------
// perspective: "host" reacciona al resultado global; un jugador, al suyo.
function GameSounds({
  room,
  perspective,
  myPlayerId,
}: {
  room: Room;
  perspective: "host" | "player";
  myPlayerId?: number | null;
}) {
  const lastKey = useRef<string>("");
  const phase = room.phase;
  const q = room.question;
  const startedAt = room.startedAt;

  useEffect(() => {
    if (phase !== "question") {
      stopTick();
      return;
    }
    startTick();
    if (!q || !startedAt) return;
    const key = `q-${startedAt}-${q.kind}`;
    if (lastKey.current !== key) {
      lastKey.current = key;
      if (q.kind === "fun") playBonusSiren();
      if (q.kind === "rescue") playRescueFanfare();
    }
    return () => stopTick();
  }, [phase, startedAt, q]);

  useEffect(() => {
    if (phase !== "reveal" || !q || !startedAt) return;
    const key = `r-${startedAt}-${q.kind}`;
    if (lastKey.current === key) return;
    lastKey.current = key;
    if (perspective === "player" && myPlayerId != null) {
      const me = room.players.find((p) => p.id === myPlayerId);
      if (me?.lastCorrect) playCorrect();
      else if (me?.answered) playIncorrect();
      return;
    }
    if (q.kind === "rescue" || q.kind === "fun") {
      const target = room.players.find((p) => p.id === room.targetPlayerId);
      if (target?.lastCorrect) {
        if (q.kind === "rescue") playRescueFanfare();
        else playCorrect();
      } else playIncorrect();
      return;
    }
    if (room.players.some((p) => p.lastCorrect)) playCorrect();
    else playIncorrect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, startedAt]);

  const rescueCelebration =
    phase === "reveal" &&
    q?.kind === "rescue" &&
    room.players.some((p) => p.id === room.targetPlayerId && p.lastCorrect);
  return rescueCelebration ? <Celebration /> : null;
}

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem("qlt-session");
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

// Código de sala que llega en el enlace del QR: la cámara del celular abre
// el juego con «#sala=CODIGO» (o «?sala=CODIGO») en la dirección. Antes el
// QR solo traía el código como texto suelto y la app nunca lo leía, así que
// escanearlo no llevaba a ninguna sala.
function linkRoomCode(): string | null {
  try {
    const fromSearch = new URLSearchParams(window.location.search).get("sala");
    const hash = window.location.hash.replace(/^#/, "");
    const fromHash = hash.includes("=")
      ? new URLSearchParams(hash).get("sala")
      : hash || null;
    const raw = (fromSearch ?? fromHash ?? "").trim().toUpperCase();
    return /^[A-Z0-9]{4,10}$/.test(raw) ? raw : null;
  } catch {
    return null;
  }
}

// Enlace que codifica el QR de la sala: la misma dirección en la que el
// anfitrión tiene abierto el juego (sin parámetros temporales de la
// sesión) más el código de la sala en el fragmento.
function joinUrlFor(code: string): string {
  try {
    const u = new URL(window.location.href);
    return `${u.origin}${u.pathname}#sala=${code}`;
  } catch {
    return `#sala=${code}`;
  }
}

function useRoom(code: string | null) {
  return useQuery({
    queryKey: ["room", code],
    queryFn: () => api.getRoom({ code: code as string }),
    enabled: !!code,
    refetchInterval: 1200,
  });
}

// ---------- QR de la sala ----------
function QrSvg({ text, label }: { text: string; label: string }) {
  const matrix = qrMatrix(text);
  const size = matrix.length;
  const quiet = 4;
  const total = size + quiet * 2;
  const cells: React.ReactNode[] = [];
  matrix.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) {
        cells.push(
          <rect key={`${x}-${y}`} x={x + quiet} y={y + quiet} width={1} height={1} fill="#2B2B2B" />,
        );
      }
    });
  });
  return (
    <svg
      viewBox={`0 0 ${total} ${total}`}
      className="h-44 w-44"
      role="img"
      aria-label={label}
    >
      <rect x={0} y={0} width={total} height={total} fill="#FFFFFF" />
      {cells}
    </svg>
  );
}

// ---------- Temporizador ----------
function TimerBar({
  startedAt,
  durationSec,
  running,
  onExpire,
}: {
  startedAt: number | null;
  durationSec: number;
  running: boolean;
  onExpire?: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const expiredFor = useRef<number | null>(null);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, [running, startedAt]);
  const elapsed = startedAt ? Math.max(0, (now - startedAt) / 1000) : 0;
  const remaining = Math.max(0, durationSec - elapsed);
  const pct = durationSec > 0 ? (remaining / durationSec) * 100 : 0;
  useEffect(() => {
    if (running && remaining <= 0 && startedAt && expiredFor.current !== startedAt) {
      expiredFor.current = startedAt;
      onExpire?.();
    }
  }, [running, remaining, startedAt, onExpire]);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold tracking-wide text-[var(--dim)]">⏱ RELOJ</span>
        <span
          className="font-display text-base tabular-nums"
          style={{
            color: remaining <= 6 && running ? "var(--danger)" : "var(--text)",
          }}
        >
          {Math.ceil(remaining)}s
        </span>
      </div>
      <div className="pixel-frame-sm mt-1 h-4 overflow-hidden bg-[var(--surface-2)]">
        <div
          className="h-full transition-[width] duration-200"
          style={{
            width: `${pct}%`,
            background:
              remaining <= 6 && running ? "var(--danger)" : "var(--accent)",
          }}
        />
      </div>
    </div>
  );
}

// ---------- Marcador ----------
function Scoreboard({
  players,
  showGains,
  highlightId,
}: {
  players: Player[];
  showGains: boolean;
  highlightId?: number | null;
}) {
  const sorted = [...players].sort((a, b) => b.score - a.score || a.id - b.id);
  return (
    <ol className="space-y-2">
      {sorted.map((p, i) => (
        <li
          key={p.id}
          className="pixel-frame-sm bg-[var(--surface)] px-3 py-2"
          style={
            highlightId === p.id
              ? { outline: "3px solid var(--accent)", outlineOffset: 1 }
              : undefined
          }
        >
          <div className="flex items-center gap-2">
            <span className="font-display w-6 text-center text-sm text-[var(--dim)]">
              {i + 1}
            </span>
            <AvatarImg avatar={p.avatar} className="h-9 w-9" />
            <span className="min-w-0 flex-1 truncate font-medium">
              {p.name}
              {p.isBot && (
                <span className="ml-2 bg-[var(--surface-2)] px-1.5 py-0.5 text-xs text-[var(--dim)]">
                  simulado
                </span>
              )}
            </span>
            {p.streak >= 2 && (
              <span className="text-xs font-bold text-[var(--accent)]" title={`Racha de ${p.streak} aciertos`}>
                racha ×{p.streak}
              </span>
            )}
            {showGains && p.lastGain > 0 && (
              <span className="font-display bg-[var(--accent)] px-2 py-0.5 text-xs text-white">
                +{p.lastGain}
              </span>
            )}
            <span className="font-display text-base tabular-nums">
              {p.score}
            </span>
          </div>
          <div className="mt-1.5 ml-8 h-2.5 overflow-hidden border border-[var(--ink)] bg-[var(--surface-2)]">
            <div
              className="h-full bg-[var(--accent)] transition-[width] duration-500"
              style={{ width: `${Math.min(100, p.score)}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

// ---------- Panel del jugador (celular) ----------
function PlayerPanel({
  room,
  playerId,
  code,
}: {
  room: Room;
  playerId: number;
  code: string;
}) {
  const queryClient = useQueryClient();
  const me = room.players.find((p) => p.id === playerId);
  const submit = useMutation({
    mutationFn: (choice: number) => api.submitAnswer({ code, playerId, choice }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["room", code] }),
  });
  const buzz = useMutation({
    mutationFn: () => api.buzz({ code, playerId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["room", code] }),
  });

  if (!me) {
    return (
      <div className="pixel-frame bg-[var(--surface)] p-4 text-[var(--dim)]">
        Ya no estás en esta sala.
      </div>
    );
  }

  const q = room.question;
  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  const myPos = sorted.findIndex((p) => p.id === playerId) + 1;
  const target = room.players.find((p) => p.id === room.targetPlayerId);

  return (
    <div className="pixel-frame bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <AvatarImg avatar={me.avatar} className="h-12 w-12" />
          <div className="min-w-0">
            <p className="truncate font-display text-sm">{me.name}</p>
            <p className="text-sm text-[var(--dim)]">
              Lugar {myPos} de {room.players.length}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl text-[var(--accent)] tabular-nums">
            {me.score}
          </p>
          <p className="text-xs text-[var(--dim)]">puntos · meta 100</p>
        </div>
      </div>

      <div className="mt-4">
        {room.phase === "lobby" && (
          <p className="rounded-xl bg-[var(--surface-2)] p-3 text-center text-[var(--dim)]">
            Esperando a que el anfitrión inicie la partida…
          </p>
        )}

        {room.phase === "buzz" && (
          <div className="text-center">
            {room.tiedIds.includes(playerId) ? (
              <>
                <p className="mb-3 font-display text-lg font-bold text-[var(--accent)]">
                  ¡Desempate! El primero en presionar responde
                </p>
                <button
                  type="button"
                  aria-label="Presionar el buzzer de desempate"
                  onClick={() => buzz.mutate()}
                  disabled={buzz.isPending}
                  className="h-36 w-36 rounded-full border-4 border-[var(--ink)] bg-[var(--danger)] font-display text-xl text-white shadow-[0_8px_0_#7A150E] active:translate-y-1 active:shadow-none"
                >
                  ¡BUZZ!
                </button>
                {buzz.data && !buzz.data.ok && (
                  <p className="mt-3 text-sm text-[var(--danger)]">{buzz.data.message}</p>
                )}
              </>
            ) : (
              <p className="rounded-xl bg-[var(--surface-2)] p-3 text-[var(--dim)]">
                Hay un desempate entre los líderes. Tú observa este turno.
              </p>
            )}
          </div>
        )}

        {room.phase === "question" && q && (
          <div>
            {(q.kind === "rescue" || q.kind === "fun") && (
              <div
                className={`pixel-frame-sm mb-3 p-3 text-center font-display text-xs leading-relaxed text-white ${
                  q.kind === "rescue" ? "bg-[#B8860B]" : "siren-flash"
                }`}
              >
                {q.kind === "rescue" ? "★ ¡PREGUNTA DE RESCATE! ★" : "» ¡PREGUNTA BONUS! «"}
                <span className="mt-1 block font-[family-name:var(--font-pixel)] text-base tracking-wide normal-case">
                  {room.targetPlayerId === playerId
                    ? "Es tu turno: vale 10 puntos"
                    : `Turno de ${target?.name ?? "otro jugador"}`}
                </span>
              </div>
            )}
            {q.kind === "tiebreak" && (
              <div className="pixel-frame-sm mb-3 bg-[var(--danger)] p-3 text-center font-display text-xs leading-relaxed text-white">
                Pregunta de desempate
                <span className="mt-1 block font-[family-name:var(--font-pixel)] text-base tracking-wide normal-case">
                  {room.targetPlayerId === playerId
                    ? "Presionaste primero: ¡responde tú!"
                    : `Responde ${target?.name ?? "el más rápido"}`}
                </span>
              </div>
            )}

            {q.kind === "normal" || room.targetPlayerId === playerId ? (
              me.answered ? (
                <p className="rounded-xl bg-[var(--surface-2)] p-4 text-center">
                  <span className="font-display text-lg font-bold text-[var(--accent-2)]">
                    Respuesta registrada
                  </span>
                  <span className="block text-sm text-[var(--dim)]">
                    Espera a que se revele la respuesta correcta…
                  </span>
                </p>
              ) : (
                <div>
                  <p className="mb-3 leading-snug font-medium">{q.text}</p>
                  <div className="grid gap-2">
                    {q.options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Opción ${LETTERS[i]}: ${opt}`}
                        onClick={() => submit.mutate(i)}
                        disabled={submit.isPending}
                        className="pixel-frame-sm flex min-h-14 items-center gap-3 bg-[var(--surface-2)] px-3 py-3 text-left active:outline-3 active:outline-[var(--accent)]"
                      >
                        <span className="font-display flex h-9 w-9 shrink-0 items-center justify-center border-2 border-[var(--ink)] bg-[var(--accent)] text-sm text-white">
                          {LETTERS[i]}
                        </span>
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                  {submit.data && !submit.data.ok && (
                    <p className="mt-2 text-sm text-[var(--danger)]">{submit.data.message}</p>
                  )}
                </div>
              )
            ) : (
              <p className="rounded-xl bg-[var(--surface-2)] p-4 text-center text-[var(--dim)]">
                Turno de <strong className="text-[var(--text)]">{target?.name}</strong>.
                Tú observa este turno.
              </p>
            )}
          </div>
        )}

        {room.phase === "reveal" && q && (
          <div>
            {q.kind === "normal" || room.targetPlayerId === playerId ? (
              <div
                className="pixel-frame-sm p-4 text-center"
                style={{
                  background: me.lastCorrect ? "#1E9E4A" : "#D42A1E",
                  color: "#FFFFFF",
                }}
              >
                <p className="font-display text-lg leading-relaxed">
                  {me.lastCorrect ? "¡Correcto!" : me.answered ? "No fue esta vez" : "Sin respuesta"}
                </p>
                {me.lastGain > 0 && (
                  <p className="font-display mt-1 text-base text-[var(--gold)]">
                    +{me.lastGain} puntos
                  </p>
                )}
                <p className="mt-2 text-sm">
                  Respuesta correcta:{" "}
                  <strong>
                    {q.correct != null ? `${LETTERS[q.correct]}. ${q.options[q.correct]}` : ""}
                  </strong>
                </p>
                {q.explanation && (
                  <p className="mt-1 text-sm text-white/90">{q.explanation}</p>
                )}
              </div>
            ) : (
              <div className="pixel-frame-sm bg-[var(--surface-2)] p-4 text-center">
                <p className="font-display text-lg font-bold">
                  {target?.name} {target && target.lastGain > 0 ? `sumó +${target.lastGain} puntos` : "no sumó en este turno"}
                </p>
                <p className="mt-1 text-sm text-[var(--dim)]">
                  Respuesta correcta:{" "}
                  {q.correct != null ? `${LETTERS[q.correct]}. ${q.options[q.correct]}` : ""}
                </p>
              </div>
            )}
          </div>
        )}

        {room.phase === "finished" && (
          <p className="rounded-xl bg-[var(--surface-2)] p-4 text-center font-display text-lg font-bold">
            Partida terminada. Revisa el resultado final.
          </p>
        )}
      </div>
    </div>
  );
}

// ---------- Resultado final ----------
function FinalView({
  room,
  onExit,
  myPlayerId,
}: {
  room: Room;
  onExit: () => void;
  myPlayerId?: number | null;
}) {
  const sorted = [...room.players].sort((a, b) => b.score - a.score || a.id - b.id);
  const winner = room.players.find((p) => p.id === room.winnerId) ?? sorted[0];
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-10">
      <GameSounds room={room} perspective={myPlayerId != null ? "player" : "host"} myPlayerId={myPlayerId} />
      <Celebration />
      <div className="pixel-frame bg-[var(--surface)] p-6 text-center">
        <AnimatedPixelLogo className="mx-auto max-w-sm" />
        <div className="mt-4">
          <RetoLegalTitle className="text-2xl" />
        </div>
        <p className="mt-4 text-sm font-bold tracking-widest text-[var(--dim)] uppercase">Ganador</p>
        {winner && (
          <div
            className="relative mx-auto mt-1 h-48 w-44"
            role="img"
            aria-label={`${winner.name} levanta el trofeo de ganador`}
          >
            <div className="winner-bounce absolute inset-x-0 bottom-0 flex justify-center">
              <AvatarImg avatar={winner.avatar} className="h-32 w-32" />
            </div>
            <div
              className="trophy-lift absolute top-0 left-1/2 text-6xl"
              aria-hidden="true"
            >
              🏆
            </div>
            <span
              className="trophy-sparkle absolute top-2 left-4 text-xl text-[var(--gold)]"
              aria-hidden="true"
            >
              ★
            </span>
            <span
              className="trophy-sparkle absolute top-6 right-4 text-xl text-[var(--gold)]"
              style={{ animationDelay: "0.5s" }}
              aria-hidden="true"
            >
              ★
            </span>
          </div>
        )}
        <p className="font-display mt-3 text-2xl leading-relaxed text-[var(--accent)]">
          {winner?.name ?? "—"}
        </p>
        <p className="font-display mt-2 text-lg tabular-nums">
          {winner?.score ?? 0} puntos
        </p>
        {winner && winner.score >= 100 && (
          <p className="mt-1 font-bold text-[var(--accent-2)]">¡Llegó a la meta de 100 puntos!</p>
        )}
        {myPlayerId != null && (
          <p className="mt-2 text-[var(--dim)]">
            {room.winnerId === myPlayerId
              ? "¡Ganaste tú!"
              : `Quedaste en el lugar ${sorted.findIndex((p) => p.id === myPlayerId) + 1}.`}
          </p>
        )}
      </div>

      <h2 className="font-display mt-6 mb-3 text-base">Ranking final</h2>
      <ol className="space-y-2">
        {sorted.map((p, i) => (
          <li
            key={p.id}
            className="pixel-frame-sm flex items-center gap-3 bg-[var(--surface)] px-4 py-3"
            style={i === 0 ? { outline: "3px solid var(--gold)", outlineOffset: 1 } : undefined}
          >
            <span className="font-display w-8 text-center text-lg text-[var(--dim)]">
              {i + 1}
            </span>
            <AvatarImg avatar={p.avatar} className="h-11 w-11" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {p.name}
                {p.isBot && <span className="ml-2 text-xs text-[var(--dim)]">(simulado)</span>}
              </p>
              <p className="text-sm text-[var(--dim)]">
                {p.correctCount} aciertos · mejor racha ×{Math.max(p.streak, 0)}
              </p>
              <div className="mt-1 h-2.5 max-w-56 overflow-hidden border border-[var(--ink)] bg-[var(--surface-2)]">
                <div
                  className="h-full bg-[var(--accent)]"
                  style={{ width: `${Math.min(100, p.score)}%` }}
                />
              </div>
            </div>
            <span className="font-display text-lg tabular-nums">{p.score}</span>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={onExit}
        className="pixel-frame-sm font-display mt-6 min-h-12 w-full bg-[var(--accent)] px-4 py-3 text-sm text-white"
      >
        Volver al inicio
      </button>
    </div>
  );
}

// ---------- Pantalla del anfitrión ----------
function HostScreen({
  session,
  setSession,
  onExit,
}: {
  session: Session;
  setSession: (s: Session | null) => void;
  onExit: () => void;
}) {
  const code = session.code;
  const queryClient = useQueryClient();
  const roomQuery = useRoom(code);
  const room = roomQuery.data;
  const [localName, setLocalName] = useState("");
  const [localAvatar, setLocalAvatar] = useState<AvatarId>("h-oscuro");
  const botTimerFor = useRef<number | null>(null);
  const buzzTimerFor = useRef<number | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["room", code] });
  const addBot = useMutation({ mutationFn: () => api.addBot({ code }), onSuccess: invalidate });
  const removePlayer = useMutation({
    mutationFn: (playerId: number) => api.removePlayer({ code, playerId }),
    onSuccess: invalidate,
  });
  const startGame = useMutation({
    mutationFn: () => api.startGame({ code }),
    onSuccess: invalidate,
  });
  const advance = useMutation({
    mutationFn: (to: "reveal" | "next") => api.advance({ code, to }),
    onSuccess: invalidate,
  });
  const botPlay = useMutation({ mutationFn: () => api.botPlay({ code }), onSuccess: invalidate });
  const botBuzz = useMutation({ mutationFn: () => api.botBuzz({ code }), onSuccess: invalidate });
  const joinLocal = useMutation({
    mutationFn: (name: string) => api.joinRoom({ code, name, avatar: localAvatar }),
    onSuccess: (res, name) => {
      if (res.ok && res.playerId != null) {
        announcePlayerJoin(name);
        setSession({ ...session, localPlayerId: res.playerId });
      }
      invalidate();
    },
  });

  // Los bots responden poco después de que aparece cada pregunta.
  useEffect(() => {
    if (!room || room.phase !== "question" || !room.startedAt) return;
    if (botTimerFor.current === room.startedAt) return;
    botTimerFor.current = room.startedAt;
    const hasBotToPlay = room.players.some(
      (p) =>
        p.isBot &&
        !p.answered &&
        (room.question?.kind === "normal" || room.targetPlayerId === p.id),
    );
    if (!hasBotToPlay) return;
    const t = setTimeout(() => botPlay.mutate(), 1600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.phase, room?.startedAt]);

  // En el desempate, un bot empatado presiona el buzzer tras unos segundos.
  useEffect(() => {
    if (!room || room.phase !== "buzz" || !room.startedAt) return;
    if (buzzTimerFor.current === room.startedAt) return;
    buzzTimerFor.current = room.startedAt;
    const tiedBot = room.players.some((p) => p.isBot && room.tiedIds.includes(p.id));
    if (!tiedBot) return;
    const t = setTimeout(() => botBuzz.mutate(), 2400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.phase, room?.startedAt]);

  // Revelado automático cuando todos los que deben responder ya lo hicieron.
  const q = room?.question;
  const eligible =
    room && q
      ? q.kind === "normal"
        ? room.players
        : room.players.filter((p) => p.id === room.targetPlayerId)
      : [];
  const allAnswered = eligible.length > 0 && eligible.every((p) => p.answered);
  useEffect(() => {
    if (!room || room.phase !== "question" || !allAnswered) return;
    const t = setTimeout(() => advance.mutate("reveal"), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.phase, allAnswered, room?.startedAt]);

  if (roomQuery.isPending || !room) {
    return <p className="p-6 text-center text-[var(--dim)]">Cargando la sala…</p>;
  }
  if (!room.ok) {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <p className="mb-4">{room.message || "La sala ya no existe."}</p>
        <button
          type="button"
          onClick={onExit}
          className="pixel-frame-sm font-display min-h-12 bg-[var(--accent)] px-5 py-3 text-sm text-white"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  if (room.phase === "finished") {
    return (
      <div className="pt-6">
        <FinalView room={room} onExit={onExit} myPlayerId={session.localPlayerId} />
      </div>
    );
  }

  const answeredCount = room.players.filter((p) => p.answered).length;
  const nextLabel =
    room.pendingBonus === "rescue"
      ? "¡Pregunta de Rescate!"
      : room.pendingBonus === "fun"
        ? "¡Pregunta Bonus!"
        : q && (q.kind === "rescue" || q.kind === "fun")
          ? "Siguiente pregunta"
          : room.currentNumber >= room.totalQuestions
            ? "Ver resultado final"
            : "Siguiente pregunta";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10">
      <GameSounds room={room} perspective="host" />
      <div className="flex flex-wrap items-center gap-2 py-4">
        <span className="pixel-frame-sm font-display bg-[var(--ink)] px-3 py-2 text-sm tracking-widest text-white">
          SALA {room.code}
        </span>
        <span className="font-display hidden text-xs tracking-wider text-[var(--accent)] sm:inline">
          RETO LEGAL
        </span>
        <span className="pixel-frame-sm bg-[var(--surface)] px-3 py-1.5 text-sm font-bold text-[var(--dim)]">
          {room.phase === "lobby"
            ? "Esperando jugadores"
            : room.phase === "buzz"
              ? "Desempate por buzzer"
              : `Pregunta ${room.currentNumber} de ${room.totalQuestions}`}
        </span>
        <span className="flex-1" />
        <SoundToggle />
        <button
          type="button"
          onClick={onExit}
          className="pixel-frame-sm bg-[var(--surface)] px-3 py-1.5 text-sm font-bold text-[var(--dim)]"
        >
          Salir de la sala
        </button>
      </div>

      {room.phase === "lobby" && (
        <div className="grid gap-4 md:grid-cols-2">
          <section className="pixel-frame bg-[var(--surface)] p-6 text-center">
            <div className="mb-3 flex items-center justify-center gap-2 bg-[var(--ink)] px-3 py-2">
              <span className="font-display text-xs tracking-wider text-white sm:text-sm">
                ÚNETE A LA PARTIDA
              </span>
            </div>
            <p className="mt-1 text-[var(--dim)]">
              Escanea el QR con la cámara de tu celular: abre el juego con el código de la sala
              ya puesto, y solo falta escribir tu nombre y elegir tu abogado. Si el QR no abre
              en tu celular, abre el juego y escribe el código de la sala a mano.
            </p>
            <div className="mt-4 flex justify-center">
              <div className="pixel-frame bg-white p-3">
                <QrSvg
                  text={joinUrlFor(room.code)}
                  label={`Código QR para unirse a la sala ${room.code}`}
                />
              </div>
            </div>
            <p className="font-display mt-4 text-3xl tracking-[0.25em] text-[var(--accent)]">
              {room.code}
            </p>
            <p className="mt-1 text-sm font-bold text-[var(--dim)]">De 1 a 10 jugadores · Meta: 100 puntos</p>
          </section>

          <section className="pixel-frame bg-[var(--surface)] p-6">
            <h2 className="font-display text-base leading-relaxed">
              Jugadores ({room.players.length}/10)
            </h2>
            {room.players.length === 0 ? (
              <p className="mt-3 text-[var(--dim)]">
                Todavía no hay jugadores. Agrega jugadores simulados para una demostración o
                espera a que tu equipo se una con el código.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {room.players.map((p) => (
                  <li
                    key={p.id}
                    className="pixel-frame-sm flex items-center gap-2 bg-[var(--surface-2)] px-3 py-2"
                  >
                    <AvatarImg avatar={p.avatar} className="h-10 w-10" />
                    <span className="flex-1 truncate font-medium">
                      {p.name}
                      {p.isBot && <span className="ml-2 text-xs text-[var(--dim)]">simulado</span>}
                      {session.localPlayerId === p.id && (
                        <span className="ml-2 text-xs font-bold text-[var(--accent-2)]">juegas aquí</span>
                      )}
                    </span>
                    <button
                      type="button"
                      aria-label={`Quitar a ${p.name} de la sala`}
                      onClick={() => removePlayer.mutate(p.id)}
                      className="px-2 py-1 text-sm font-bold text-[var(--danger)]"
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => addBot.mutate()}
                disabled={addBot.isPending || room.players.length >= 10}
                className="pixel-frame-sm min-h-11 bg-[var(--surface)] px-4 py-2 font-bold"
              >
                Agregar jugador simulado
              </button>
              {session.localPlayerId == null ? (
                <div className="grid gap-2">
                  <div className="flex gap-2">
                    <label className="sr-only" htmlFor="local-name">
                      Tu nombre para jugar en esta pantalla
                    </label>
                    <input
                      id="local-name"
                      value={localName}
                      onChange={(e) => setLocalName(e.target.value)}
                      placeholder="Tu nombre (para jugar aquí)"
                      className="pixel-frame-sm min-h-11 flex-1 bg-[var(--surface-2)] px-3"
                    />
                    <button
                      type="button"
                      onClick={() => localName.trim() && joinLocal.mutate(localName.trim())}
                      disabled={joinLocal.isPending || !localName.trim()}
                      className="pixel-frame-sm min-h-11 bg-[var(--surface)] px-4 py-2 font-bold"
                    >
                      Jugar aquí
                    </button>
                  </div>
                  <AvatarPicker value={localAvatar} onChange={setLocalAvatar} name={localName} />
                </div>
              ) : (
                <p className="text-sm text-[var(--accent-2)]">
                  Ya estás jugando desde esta pantalla; tu panel de jugador aparece junto al
                  tablero.
                </p>
              )}
              {joinLocal.data && !joinLocal.data.ok && (
                <p className="text-sm text-[var(--danger)]">{joinLocal.data.message}</p>
              )}
              <button
                type="button"
                onClick={() => startGame.mutate()}
                disabled={startGame.isPending || room.players.length < 1}
                className="pixel-frame-sm font-display min-h-13 bg-[var(--accent)] px-4 py-3 text-sm text-white disabled:opacity-40"
              >
                ▶ Iniciar partida
              </button>
              {startGame.data && !startGame.data.ok && (
                <p className="text-sm text-[var(--danger)]">{startGame.data.message}</p>
              )}
              <p className="text-sm text-[var(--dim)]">
                15 preguntas al azar del banco · 30 segundos por pregunta · fácil 5, media 10,
                difícil 15 puntos, con bonus de rapidez y de racha.
              </p>
            </div>
          </section>
        </div>
      )}

      {room.phase !== "lobby" && q && (
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div>
            {(q.kind === "rescue" || q.kind === "fun") && (
              <div className="pixel-frame mb-4 overflow-hidden bg-[var(--surface)]">
                <div className="relative">
                  <img
                    src={q.kind === "rescue" ? rescateArt : bonusArt}
                    alt={
                      q.kind === "rescue"
                        ? "Arte pixelado de la Pregunta de Rescate con los colores de Total Cyber-Sec"
                        : "Arte pixelado de la Pregunta Bonus con sirena y los colores de Total Cyber-Sec"
                    }
                    className="pixel-art h-36 w-full object-cover object-center sm:h-44"
                  />
                  {q.kind === "fun" && room.phase === "question" && (
                    <span className="siren-flash absolute top-2 right-2 border-2 border-[var(--ink)] px-2 py-1 font-display text-[10px] text-white">
                      ¡ALERTA!
                    </span>
                  )}
                </div>
                <div
                  className="p-3 text-center text-white"
                  style={{ background: q.kind === "rescue" ? "#B8860B" : "#D42A1E" }}
                >
                  <p className="font-display text-base leading-relaxed sm:text-lg">
                    {q.kind === "rescue" ? "★ ¡PREGUNTA DE RESCATE! ★" : "» ¡PREGUNTA BONUS! «"}
                  </p>
                  <p className="font-bold">
                    Solo juega{" "}
                    {room.players.find((p) => p.id === room.targetPlayerId)?.name ?? "un jugador"} ·
                    vale 10 puntos
                  </p>
                </div>
              </div>
            )}
            {room.phase === "buzz" && (
              <div className="pixel-frame mb-4 bg-[var(--danger)] p-4 text-center text-white">
                <p className="font-display text-lg leading-relaxed">DESEMPATE POR BUZZER</p>
                <p className="font-bold">
                  Empatados:{" "}
                  {room.players
                    .filter((p) => room.tiedIds.includes(p.id))
                    .map((p) => p.name)
                    .join(", ")}
                  . El primero en presionar su buzzer responde.
                </p>
              </div>
            )}

            <section className="pixel-frame bg-[var(--surface)] p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="border-2 border-[var(--ink)] px-3 py-1 text-sm font-bold text-white"
                  style={{ background: catColor(q.category) }}
                >
                  {q.category}
                </span>
                <span className="pixel-frame-sm bg-[var(--surface-2)] px-3 py-1 text-sm font-bold text-[var(--dim)]">
                  {q.difficulty}
                  {q.kind === "normal" ? ` · ${q.points} pts` : q.kind !== "tiebreak" ? " · 10 pts" : ""}
                </span>
                <span className="flex-1" />
                <span className="text-sm font-bold text-[var(--dim)]">
                  {room.phase === "question"
                    ? `Han respondido ${answeredCount} de ${eligible.length}`
                    : room.phase === "reveal"
                      ? "Respuesta revelada"
                      : ""}
                </span>
              </div>

              <div className="mt-4 flex gap-4">
                <figure className="hidden w-28 shrink-0 sm:block lg:w-36">
                  <div className="pixel-frame overflow-hidden bg-[#dfe9f5]">
                    <img
                      src={presentadorImg}
                      alt="Presentador del quiz: hombre mayor, con bigote, formal, con traje"
                      className="pixel-art presenter-bob aspect-[25/27] w-full object-cover object-top"
                    />
                  </div>
                  <figcaption className="font-display mt-2 text-center text-[10px] leading-relaxed text-[var(--dim)]">
                    EL PRESENTADOR
                  </figcaption>
                </figure>
                <h2 className="min-w-0 flex-1 text-2xl leading-snug font-medium sm:text-[28px]">
                  {room.phase === "question" ? (
                    <TypewriterText key={q.text} text={q.text} />
                  ) : (
                    q.text
                  )}
                </h2>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, i) => {
                  const isCorrect = room.phase === "reveal" && q.correct === i;
                  const choosers =
                    room.phase === "reveal"
                      ? room.players.filter((p) => p.answerChoice === i)
                      : [];
                  const wrongPicked =
                    room.phase === "reveal" && !isCorrect && choosers.length > 0;
                  return (
                    <div
                      key={i}
                      className="pixel-frame-sm p-3"
                      style={{
                        background: isCorrect
                          ? "#1E9E4A"
                          : wrongPicked
                            ? "#D42A1E"
                            : "var(--surface-2)",
                        color: isCorrect || wrongPicked ? "#FFFFFF" : "var(--text)",
                        opacity: room.phase === "reveal" && !isCorrect && !wrongPicked ? 0.6 : 1,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="font-display flex h-9 w-9 shrink-0 items-center justify-center border-2 border-[var(--ink)] text-sm text-white"
                          style={{ background: catColor(q.category) }}
                        >
                          {LETTERS[i]}
                        </span>
                        <span className="pt-1 font-medium">{opt}</span>
                      </div>
                      {choosers.length > 0 && (
                        <p
                          className="mt-2 pl-12 text-sm"
                          style={{ color: isCorrect || wrongPicked ? "#FFE9C9" : "var(--dim)" }}
                        >
                          {choosers.map((p) => p.name).join(", ")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {room.phase === "reveal" && q.explanation && (
                <div className="pixel-frame-sm mt-4 bg-[var(--surface-2)] p-4">
                  <p className="font-display text-xs text-[var(--accent)]">EXPLICACIÓN</p>
                  <p className="mt-1">{q.explanation}</p>
                </div>
              )}

              <div className="mt-5">
                <TimerBar
                  startedAt={room.startedAt}
                  durationSec={q.durationSec}
                  running={room.phase === "question"}
                  onExpire={() => {
                    if (room.phase === "question") advance.mutate("reveal");
                  }}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {room.phase === "question" && (
                  <button
                    type="button"
                    onClick={() => advance.mutate("reveal")}
                    disabled={advance.isPending}
                    className="pixel-frame-sm font-display min-h-12 flex-1 bg-[var(--accent)] px-4 py-3 text-sm text-white"
                  >
                    Revelar respuesta
                  </button>
                )}
                {room.phase === "reveal" && (
                  <button
                    type="button"
                    onClick={() => advance.mutate("next")}
                    disabled={advance.isPending}
                    className="pixel-frame-sm font-display min-h-12 flex-1 bg-[var(--accent)] px-4 py-3 text-sm text-white"
                  >
                    {nextLabel}
                  </button>
                )}
                {advance.data && !advance.data.ok && (
                  <p className="w-full text-sm text-[var(--danger)]">{advance.data.message}</p>
                )}
              </div>
            </section>

            {session.localPlayerId != null && (
              <div className="mt-4">
                <p className="font-display mb-2 text-xs tracking-wide text-[var(--dim)] uppercase">
                  Tu celular (en esta pantalla)
                </p>
                <PlayerPanel room={room} playerId={session.localPlayerId} code={code} />
              </div>
            )}
          </div>

          <aside>
            <h2 className="font-display mb-2 text-sm leading-relaxed">
              Tablero · rumbo a 100
            </h2>
            <Scoreboard
              players={room.players}
              showGains={room.phase === "reveal"}
              highlightId={room.targetPlayerId}
            />
          </aside>
        </div>
      )}
    </div>
  );
}

// ---------- Pantalla del jugador (dispositivo propio) ----------
function PlayerScreen({
  session,
  onExit,
}: {
  session: Session;
  onExit: () => void;
}) {
  const roomQuery = useRoom(session.code);
  const room = roomQuery.data;

  if (roomQuery.isPending || !room) {
    return <p className="p-6 text-center text-[var(--dim)]">Conectando con la sala…</p>;
  }
  if (!room.ok || session.playerId == null) {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <p className="mb-4">{room.ok ? "No se encontró tu registro en la sala." : room.message}</p>
        <button
          type="button"
          onClick={onExit}
          className="pixel-frame-sm font-display min-h-12 bg-[var(--accent)] px-5 py-3 text-sm text-white"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  if (room.phase === "finished") {
    return (
      <div className="pt-6">
        <FinalView room={room} onExit={onExit} myPlayerId={session.playerId} />
      </div>
    );
  }

  const q = room.question;
  return (
    <div className="mx-auto w-full max-w-md px-4 pb-10">
      <GameSounds room={room} perspective="player" myPlayerId={session.playerId} />
      <div className="flex flex-wrap items-center gap-2 py-4">
        <span className="pixel-frame-sm font-display bg-[var(--ink)] px-3 py-2 text-xs tracking-widest text-white">
          SALA {room.code}
        </span>
        <span className="font-display hidden text-[10px] tracking-wider text-[var(--accent)] sm:inline">
          RETO LEGAL
        </span>
        {room.phase !== "lobby" && (
          <span className="text-sm font-bold text-[var(--dim)]">
            Pregunta {room.currentNumber} de {room.totalQuestions}
          </span>
        )}
        <span className="flex-1" />
        <SoundToggle />
        <button
          type="button"
          onClick={onExit}
          className="pixel-frame-sm bg-[var(--surface)] px-3 py-1.5 text-sm font-bold text-[var(--dim)]"
        >
          Salir
        </button>
      </div>

      {q && room.phase !== "lobby" && (
        <div className="mb-4">
          <TimerBar
            startedAt={room.startedAt}
            durationSec={q.durationSec}
            running={room.phase === "question"}
          />
        </div>
      )}

      <PlayerPanel room={room} playerId={session.playerId} code={session.code} />

      {room.phase !== "lobby" && (
        <div className="mt-4">
          <h2 className="font-display mb-2 text-xs tracking-wide text-[var(--dim)] uppercase">
            Así va el tablero
          </h2>
          <Scoreboard players={room.players} showGains={room.phase === "reveal"} />
        </div>
      )}
    </div>
  );
}

// ---------- Banco de preguntas / Totalsec ----------
function BankScreen({ onBack }: { onBack: () => void }) {
  const queryClient = useQueryClient();
  const stats = useQuery({ queryKey: ["bank-stats"], queryFn: () => api.getBankStats({}) });
  const customs = useQuery({
    queryKey: ["custom-questions"],
    queryFn: () => api.listCustomQuestions({}),
  });
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [difficulty, setDifficulty] = useState<"Fácil" | "Media" | "Difícil">("Fácil");
  const [explanation, setExplanation] = useState("");
  const [formMsg, setFormMsg] = useState("");

  const addQ = useMutation({
    mutationFn: () =>
      api.addCustomQuestion({
        text: text.trim(),
        options: options.map((o) => o.trim()),
        correct,
        difficulty,
        explanation: explanation.trim(),
      }),
    onSuccess: (res) => {
      setFormMsg(res.message);
      if (res.ok) {
        setText("");
        setOptions(["", "", "", ""]);
        setExplanation("");
        setCorrect(0);
        queryClient.invalidateQueries({ queryKey: ["custom-questions"] });
        queryClient.invalidateQueries({ queryKey: ["bank-stats"] });
      }
    },
  });
  const delQ = useMutation({
    mutationFn: (id: number) => api.deleteCustomQuestion({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-questions"] });
      queryClient.invalidateQueries({ queryKey: ["bank-stats"] });
    },
  });

  const formValid =
    text.trim().length >= 5 && options.every((o) => o.trim().length > 0);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-10">
      <div className="flex items-center gap-2 py-4">
        <button
          type="button"
          onClick={onBack}
          className="pixel-frame-sm bg-[var(--surface)] px-3 py-1.5 text-sm font-bold"
        >
          ← Volver
        </button>
        <h1 className="font-display text-base">Banco de preguntas</h1>
      </div>

      <section className="pixel-frame bg-[var(--surface)] p-5">
        <h2 className="font-display text-sm leading-relaxed">Categorías del juego</h2>
        <p className="mt-1 text-sm text-[var(--dim)]">
          {stats.data
            ? `${stats.data.totalComplete} preguntas jugables. Cada partida elige 15 al azar, al menos una por categoría.`
            : "Cargando…"}
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {(stats.data?.categories ?? []).map((c) => (
            <li
              key={c.name}
              className="flex items-center gap-2 rounded-xl bg-[var(--surface-2)] px-3 py-2"
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: catColor(c.name) }}
              />
              <span className="flex-1">{c.name}</span>
              <span className="font-display font-extrabold tabular-nums">
                {c.count === 0 ? "pendiente" : c.count}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="pixel-frame mt-4 bg-[var(--surface)] p-5">
        <h2 className="font-display text-sm leading-relaxed text-[var(--accent)]">
          Categoría Totalsec
        </h2>
        {stats.data && stats.data.totalsecCount === 0 ? (
          <p className="mt-1 text-sm">
            Esta categoría quedó <strong>vacía a propósito</strong>: las preguntas tratan de datos
            reales de Totalsec (fecha de constitución, RFC, accionistas, capital social, objeto
            social, domicilio, marcas ante el IMPI y certificaciones ISO) que solo tú puedes
            proporcionar. En cuanto agregues la primera pregunta con el formulario de abajo, la
            categoría entra automáticamente a las partidas, sin tocar nada más de la app.
          </p>
        ) : (
          <p className="mt-1 text-sm">
            Ya hay {stats.data?.totalsecCount ?? 0} pregunta(s) de Totalsec en el banco y entran en
            las partidas. Puedes seguir agregando más cuando quieras.
          </p>
        )}

        {(customs.data?.questions ?? []).length > 0 && (
          <ul className="mt-3 space-y-2">
            {(customs.data?.questions ?? []).map((item) => (
              <li key={item.id} className="rounded-xl bg-[var(--surface-2)] px-3 py-2">
                <div className="flex items-start gap-2">
                  <p className="flex-1 font-medium">{item.text}</p>
                  <button
                    type="button"
                    aria-label={`Eliminar la pregunta: ${item.text}`}
                    onClick={() => delQ.mutate(item.id)}
                    className="rounded-lg px-2 py-1 text-sm text-[var(--danger)]"
                  >
                    Eliminar
                  </button>
                </div>
                <p className="mt-1 text-sm text-[var(--dim)]">
                  {item.difficulty} · {item.points} pts · Correcta: {LETTERS[item.correct]}.{" "}
                  {item.options[item.correct]}
                </p>
              </li>
            ))}
          </ul>
        )}

        <form
          className="mt-4 grid gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (formValid) addQ.mutate();
          }}
        >
          <h3 className="font-display font-bold">Agregar pregunta de Totalsec</h3>
          <label className="grid gap-1 text-sm">
            Pregunta
            <input
              aria-label="Texto de la pregunta de Totalsec"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ej. ¿En qué año se constituyó Totalsec?"
              className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3"
            />
          </label>
          {options.map((opt, i) => (
            <label key={i} className="grid gap-1 text-sm">
              Opción {LETTERS[i]}
              <input
                aria-label={`Opción ${LETTERS[i]}`}
                value={opt}
                onChange={(e) =>
                  setOptions(options.map((o, j) => (j === i ? e.target.value : o)))
                }
                className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3"
              />
            </label>
          ))}
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              Respuesta correcta
              <select
                aria-label="Respuesta correcta"
                value={correct}
                onChange={(e) => setCorrect(Number(e.target.value))}
                className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3"
              >
                {LETTERS.map((l, i) => (
                  <option key={l} value={i}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Dificultad
              <select
                aria-label="Dificultad de la pregunta"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as "Fácil" | "Media" | "Difícil")}
                className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3"
              >
                <option value="Fácil">Fácil · 5 pts</option>
                <option value="Media">Media · 10 pts</option>
                <option value="Difícil">Difícil · 15 pts</option>
              </select>
            </label>
          </div>
          <label className="grid gap-1 text-sm">
            Explicación (opcional)
            <input
              aria-label="Explicación de la respuesta"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Ej. Según el acta constitutiva de la sociedad…"
              className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3"
            />
          </label>
          <button
            type="submit"
            disabled={!formValid || addQ.isPending}
            className="pixel-frame-sm font-display min-h-12 bg-[var(--accent)] px-4 py-3 text-sm text-white disabled:opacity-40"
          >
            Agregar al banco
          </button>
          {formMsg && <p className="text-sm text-[var(--dim)]">{formMsg}</p>}
        </form>
      </section>
    </div>
  );
}

// ---------- Título RETO LEGAL ----------
// Estilo arcade/SNES pedido por Víctor: letras pixel con degradado
// naranja→rojo del logo de Total Cyber-Sec, contorno oscuro grueso,
// sombra dura desplazada y un pulso de brillo suave (clases en theme.css).
function RetoLegalTitle({ className = "" }: { className?: string }) {
  return (
    <span
      className={`reto-title title-pop font-display inline-block leading-[1.15] ${className}`}
      role="img"
      aria-label="RETO LEGAL"
    >
      <span className="reto-title-word block" aria-hidden="true">
        RETO
      </span>
      <span className="reto-title-word block" aria-hidden="true">
        LEGAL
      </span>
    </span>
  );
}

// ---------- Logo pixelado animado de Total Cyber-Sec ----------
// El mismo video en bucle de la pantalla principal y del intro, con la
// imagen pixelada como póster y respaldo, sobre el fondo azul tenue.
function AnimatedPixelLogo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }
    void v.play().catch(() => {
      // Queda visible la imagen pixelada del logo.
    });
  }, []);
  return (
    <div className={`relative aspect-[1632/544] w-full ${className}`}>
      <img
        src={introPixel}
        alt="Logo de Total Cyber-Sec en arte pixelado"
        className="pixel-art absolute inset-0 h-full w-full object-contain"
      />
      <video
        ref={ref}
        className="pixel-art absolute inset-0 h-full w-full object-contain"
        autoPlay
        muted
        loop
        playsInline
        poster={introPixel}
        aria-label="Logo animado de Total Cyber-Sec en arte pixelado"
      >
        <source src={introVideo} type="video/mp4" />
      </video>
    </div>
  );
}

const LICENCIA = "Videojuego creado en 2026 · Todos los derechos reservados";

// ---------- Intro estilo Metal Warriors / Konami (SNES) ----------
// Secuencia aprobada por Víctor, inspirada solo en el primer minuto del
// video de Metal Warriors: logo de Total Cyber-Sec en pixel (con su video),
// logo de Muse de Meta, historia de la Tierra, título RETO LEGAL,
// licenciamiento 2026 y menú Iniciar / Instrucciones.
type IntroStep = "tcs" | "muse" | "historia" | "titulo" | "menu";

const STORY_TEXT =
  "En el año 2026, el planeta Tierra depende de la tecnología para todo: sus datos, sus contratos y su seguridad viajan por redes que nunca duermen. Pero la tecnología sin leyes es un riesgo para todos. Por eso, la Tierra necesita abogados especializados en tecnología, capaces de proteger los datos, defender los contratos y cuidar a la sociedad digital.";

function IntroScreen({
  initialStep = "tcs",
  onStart,
  onInstructions,
}: {
  initialStep?: IntroStep;
  onStart: () => void;
  onInstructions: () => void;
}) {
  const [step, setStep] = useState<IntroStep>(initialStep);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Música chiptune desde el intro: intenta sola y, si el explorador la
  // bloquea, arranca con el primer clic o toque (también en computadora).
  useEffect(() => {
    startIntro();
    const kick = () => startIntro();
    window.addEventListener("pointerdown", kick);
    return () => window.removeEventListener("pointerdown", kick);
  }, []);

  // El video del logo pixelado se reproduce en bucle, silenciado.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }
    void v.play().catch(() => {
      // Queda visible el póster pixelado del logo.
    });
  }, [step]);

  // Audio de cada paso: fanfarria del logo y narración de la historia.
  // (El título RETO LEGAL ya no lleva audio: Víctor pidió quitarlo.)
  useEffect(() => {
    if (step === "tcs") playIntroFanfare();
    else if (step === "historia") playIntroStory();
  }, [step]);

  // Avance automático de los primeros pasos, como en el intro de SNES.
  useEffect(() => {
    const durations: Partial<Record<IntroStep, number>> = {
      tcs: 5200,
      muse: 4200,
      historia: 17000,
    };
    const d = durations[step];
    if (!d) return;
    const next: Partial<Record<IntroStep, IntroStep>> = {
      tcs: "muse",
      muse: "historia",
      historia: "titulo",
    };
    const t = setTimeout(() => {
      const n = next[step];
      if (n) setStep(n);
    }, d);
    return () => clearTimeout(t);
  }, [step]);

  const skip = () => setStep("menu");

  return (
    <div className="mx-auto flex min-h-[92vh] w-full max-w-3xl flex-col px-4 pb-10">
      <div className="flex items-center justify-end gap-2 pt-4">
        <SoundToggle />
        {step !== "menu" && (
          <button
            type="button"
            onClick={skip}
            className="pixel-frame-sm bg-[var(--surface)] px-3 py-1.5 text-sm font-bold text-[var(--dim)]"
          >
            Saltar intro ▸▸
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
        {step === "tcs" && (
          <div key="tcs" className="intro-step w-full">
            <div className="pixel-frame overflow-hidden bg-[var(--bg)]">
              <div className="p-2.5 sm:p-4">
                <div className="relative mx-auto aspect-[1632/544] w-full max-w-2xl">
                  <img
                    src={introPixel}
                    alt="Logo de Total Cyber-Sec en arte pixelado"
                    className="pixel-art absolute inset-0 h-full w-full object-contain"
                  />
                  <video
                    ref={videoRef}
                    className="pixel-art absolute inset-0 h-full w-full object-contain"
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={introPixel}
                    aria-label="Video en bucle del logo de Total Cyber-Sec en arte pixelado"
                  >
                    <source src={introVideo} type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>
            <p className="font-display mt-5 text-sm tracking-wider text-[var(--dim)]">
              TOTAL CYBER-SEC
            </p>
          </div>
        )}

        {step === "muse" && (
          <div key="muse" className="intro-step w-full">
            <div className="pixel-frame mx-auto max-w-md bg-[var(--surface)] px-6 py-10">
              <p className="flex items-center justify-center gap-3">
                <svg viewBox="0 0 24 24" className="h-12 w-12" aria-hidden="true">
                  <path
                    d="M12 1 L14.2 9.8 L23 12 L14.2 14.2 L12 23 L9.8 14.2 L1 12 L9.8 9.8 Z"
                    fill="#e8490f"
                    stroke="#2b2b2b"
                    strokeWidth="1.2"
                  />
                </svg>
                <span className="font-display text-4xl text-[#3d4b5c] lowercase">muse</span>
              </p>
              <p className="mt-3 text-lg font-bold tracking-widest text-[var(--dim)]">by Meta</p>
            </div>
            <p className="font-display mt-5 text-sm tracking-wider text-[var(--dim)]">
              POWERED BY MUSE
            </p>
          </div>
        )}

        {step === "historia" && (
          <div key="historia" className="intro-step w-full max-w-2xl">
            <div className="pixel-frame bg-[var(--surface)] p-6 text-left sm:p-8">
              <p className="font-display text-xs tracking-wider text-[var(--accent)]">
                [ TRANSMISIÓN · PLANETA TIERRA · 2026 ]
              </p>
              <p className="mt-4 text-2xl leading-snug font-medium">
                <TypewriterText key={STORY_TEXT} text={STORY_TEXT} />
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep("titulo")}
              className="press-start-blink font-display mt-6 text-sm text-[var(--dim)]"
            >
              Toca para continuar ▸
            </button>
          </div>
        )}

        {step === "titulo" && (
          <div key="titulo" className="intro-step w-full">
            <p className="text-base font-bold tracking-widest text-[var(--accent)] uppercase">
              Total Cyber-Sec · El área Legal presenta
            </p>
            <h1 className="mt-5">
              <RetoLegalTitle className="text-6xl sm:text-7xl" />
            </h1>
            <p className="mt-6 text-sm font-bold text-[var(--dim)]">{LICENCIA}</p>
            <button
              type="button"
              onClick={() => setStep("menu")}
              className="press-start-blink font-display mt-8 min-h-12 px-4 text-base text-[var(--text)]"
            >
              ▸ Toca para continuar ◂
            </button>
          </div>
        )}

        {step === "menu" && (
          <div key="menu" className="intro-step w-full max-w-md">
            <h1>
              <RetoLegalTitle className="text-5xl sm:text-6xl" />
            </h1>
            <div className="mt-10 grid gap-3">
              <button
                type="button"
                onClick={onStart}
                className="pixel-frame-sm font-display min-h-14 bg-[var(--accent)] px-4 py-4 text-base text-white"
              >
                ▶ Iniciar
              </button>
              <button
                type="button"
                onClick={onInstructions}
                className="pixel-frame-sm font-display min-h-14 bg-[var(--ink)] px-4 py-4 text-base text-white"
              >
                Instrucciones
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Instrucciones del juego ----------
function InstructionsScreen({
  onBack,
  onStart,
}: {
  onBack: () => void;
  onStart: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-10">
      <div className="flex items-center gap-2 py-4">
        <button
          type="button"
          onClick={onBack}
          className="pixel-frame-sm bg-[var(--surface)] px-3 py-1.5 text-sm font-bold"
        >
          ← Volver
        </button>
        <h1 className="font-display text-base">Instrucciones · RETO LEGAL</h1>
        <span className="flex-1" />
        <SoundToggle />
      </div>

      <section className="pixel-frame bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="font-display text-sm leading-relaxed text-[var(--accent)]">Cómo se juega</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            El anfitrión crea la sala en la pantalla principal y proyecta el tablero con el código
            y el código QR.
          </li>
          <li>
            Cada jugador escanea el QR con la cámara de su celular (o escribe el código de la
            sala), pone su nombre y elige su abogado o abogada entre los 8 personajes con traje.
          </li>
          <li>
            La pregunta se lee en la pantalla del anfitrión, con el presentador y el reloj de 30
            segundos; en el celular solo aparecen los botones grandes A, B, C y D para responder.
          </li>
          <li>Al revelarse, la respuesta correcta se tiñe de verde y las elegidas incorrectas, de rojo.</li>
        </ol>
      </section>

      <section className="pixel-frame mt-4 bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="font-display text-sm leading-relaxed text-[var(--accent)]">Puntos y meta</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>De 1 a 10 jugadores; gana quien llegue a 100 puntos o tenga el mayor puntaje al final de las 15 preguntas.</li>
          <li>Fácil 5 pts · media 10 pts · difícil 15 pts. Acertar en menos de 10 segundos suma +5, y una racha de 3 aciertos suma +5. Sin puntos negativos.</li>
          <li>Si hay empate al final, se decide con una pregunta relámpago: el primero en presionar el buzzer de su celular responde.</li>
        </ul>
      </section>

      <section className="pixel-frame mt-4 bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="font-display text-sm leading-relaxed text-[var(--accent)]">Interrupciones especiales</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong>Pregunta de Rescate:</strong> tras la pregunta 5 y la 10, si el último lugar va
            25 puntos o más detrás del líder, juega solo una pregunta muy fácil que vale 10 puntos
            (máximo 2 rescates por jugador). Si acierta, ¡confeti y fuegos artificiales!
          </li>
          <li>
            <strong>Pregunta Bonus:</strong> en un momento sorpresa de la partida, suena la sirena
            y un jugador al azar juega solo una pregunta divertida que vale 10 puntos.
          </li>
        </ul>
      </section>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onStart}
          className="pixel-frame-sm font-display min-h-13 bg-[var(--accent)] px-4 py-3 text-sm text-white"
        >
          ▶ Iniciar
        </button>
        <button
          type="button"
          onClick={onBack}
          className="pixel-frame-sm font-display min-h-13 bg-[var(--surface)] px-4 py-3 text-sm"
        >
          Volver
        </button>
      </div>
      <p className="mt-4 text-center text-sm font-bold text-[var(--dim)]">{LICENCIA}</p>
    </div>
  );
}

// ---------- Inicio ----------
function HomeScreen({
  setSession,
  onBank,
  onInstructions,
  linkCode,
}: {
  setSession: (s: Session | null) => void;
  onBank: () => void;
  onInstructions: () => void;
  linkCode?: string | null;
}) {
  const stats = useQuery({ queryKey: ["bank-stats"], queryFn: () => api.getBankStats({}) });
  const introVideoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = introVideoRef.current;
    if (!v) return;
    v.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }
    void v.play().catch(() => {
      // Si el navegador bloquea la reproducción, queda visible la imagen pixelada.
    });
  }, []);
  // Canción de intro chiptune en bucle mientras está la pantalla inicial.
  // Si el navegador bloquea el autoplay con sonido, arranca con el primer
  // toque o clic del usuario en cualquier parte de la pantalla (esto
  // corrige que en la computadora no se escuchara la música).
  useEffect(() => {
    startIntro();
    const kick = () => startIntro();
    window.addEventListener("pointerdown", kick);
    return () => {
      window.removeEventListener("pointerdown", kick);
      stopIntro();
    };
  }, []);
  const [joinCode, setJoinCode] = useState(linkCode ?? "");
  const [joinName, setJoinName] = useState("");
  const [joinAvatar, setJoinAvatar] = useState<AvatarId>("m-blazer");
  const [demoName, setDemoName] = useState("");
  const [demoAvatar, setDemoAvatar] = useState<AvatarId>("h-oscuro");
  const [error, setError] = useState("");

  const create = useMutation({
    mutationFn: () => api.createRoom({}),
    onSuccess: (res) => {
      if (res.ok) setSession({ role: "host", code: res.code, playerId: null, localPlayerId: null });
      else setError(res.message);
    },
  });
  const join = useMutation({
    mutationFn: () =>
      api.joinRoom({ code: joinCode.trim().toUpperCase(), name: joinName.trim(), avatar: joinAvatar }),
    onSuccess: (res) => {
      if (res.ok && res.playerId != null) {
        // Confirmación al unirse: fanfarria corta y el nombre leído en voz
        // alta («¡<nombre> se une al reto!»).
        announcePlayerJoin(joinName.trim());
        // Quita el #sala= de la dirección para que una recarga posterior
        // no vuelva a interceptar la sesión ya iniciada.
        try {
          window.history.replaceState(null, "", window.location.pathname);
        } catch {
          // sin historial disponible; no pasa nada
        }
        setSession({
          role: "player",
          code: joinCode.trim().toUpperCase(),
          playerId: res.playerId,
          localPlayerId: null,
        });
      } else setError(res.message);
    },
  });
  const demo = useMutation({
    mutationFn: async () => {
      const room = await api.createRoom({});
      if (!room.ok) throw new Error(room.message);
      const code = room.code;
      for (let i = 0; i < 4; i++) await api.addBot({ code });
      const joined = await api.joinRoom({
        code,
        name: demoName.trim() || "Jugador 1",
        avatar: demoAvatar,
      });
      if (!joined.ok || joined.playerId == null) throw new Error(joined.message);
      const started = await api.startGame({ code });
      if (!started.ok) throw new Error(started.message);
      return { code, playerId: joined.playerId };
    },
    onSuccess: (res) => {
      // La demo también confirma al jugador con fanfarria y su nombre en voz alta.
      announcePlayerJoin(demoName.trim() || "Jugador 1");
      setSession({ role: "host", code: res.code, playerId: null, localPlayerId: res.playerId });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "No se pudo iniciar la demo."),
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-10">
      <div className="flex items-center justify-between gap-2 pt-4">
        <span className="font-display text-[10px] tracking-wider text-[var(--dim)] sm:text-xs">
          RETO LEGAL · EQUIPO LEGAL
        </span>
        <SoundToggle />
      </div>

      <section aria-label="Intro de Total Cyber-Sec" className="pt-3">
        <div className="pixel-frame overflow-hidden bg-[var(--bg)]">
          {/* El logo va contenido (sin recorte) y con márgenes: antes el
              video se estiraba a la fuerza y su línea inferior quedaba
              cortada por el marco. */}
          <div className="p-2.5 sm:p-4">
            <div className="relative mx-auto aspect-[1632/544] w-full max-w-2xl">
              <img
                src={introPixel}
                alt="Logo pixelado de Total Cyber-Sec: escudo triangular naranja y rojo, lema Data and people security"
                className="pixel-art absolute inset-0 h-full w-full object-contain"
              />
              <video
                ref={introVideoRef}
                className="pixel-art absolute inset-0 h-full w-full object-contain"
                autoPlay
                muted
                loop
                playsInline
                poster={introPixel}
                aria-label="Video en bucle de la intro pixelada de Total Cyber-Sec, con el logo de la empresa en arte pixelado"
              >
                <source src={introVideo} type="video/mp4" />
              </video>
            </div>
          </div>
          <div className="border-t-2 border-[var(--ink)] bg-[var(--surface)] px-3 py-3 text-center">
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
              <span className="font-display text-xs font-black tracking-wide whitespace-nowrap text-[#e8490f] sm:text-sm">
                TOTAL CYBER-SEC
              </span>
              <span aria-hidden="true" className="font-black text-[#3d3d3d]">
                ▸
              </span>
              <span className="font-display text-xs font-extrabold tracking-wide whitespace-nowrap text-[#3d3d3d] sm:text-sm">
                EL ÁREA LEGAL PRESENTA
              </span>
              <span aria-hidden="true" className="font-black text-[#3d3d3d]">
                ▸
              </span>
              <span className="font-display text-xs font-black tracking-wide whitespace-nowrap text-[#e8490f] sm:text-sm">
                POWERED BY MUSE
              </span>
            </p>
          </div>
        </div>
      </section>

      <header className="pt-6 pb-8 text-center">
        <p className="text-base font-bold tracking-widest text-[var(--accent)] uppercase">
          Concurso de conocimiento · Equipo Legal
        </p>
        <h1 className="mt-4">
          <RetoLegalTitle className="text-4xl sm:text-5xl" />
        </h1>
        <p className="font-display mt-4 text-base leading-relaxed md:text-lg">
          ¿Quién llega primero a <span className="text-[var(--accent)]">100 puntos</span>?
        </p>
        <p className="mx-auto mt-3 max-w-xl text-[var(--dim)]">
          15 preguntas al azar de derecho mexicano, contratos, datos personales, ciberseguridad,
          normas ISO, inteligencia artificial y derecho penal. El anfitrión proyecta el tablero y
          cada quien responde desde su celular.
        </p>
        {stats.data && (
          <p className="mt-3 text-sm text-[var(--dim)]">
            Banco listo: {stats.data.totalComplete} preguntas jugables
            {stats.data.totalsecCount === 0
              ? " · la categoría Totalsec se agregará después, con los datos reales de la empresa"
              : ` · incluye ${stats.data.totalsecCount} de Totalsec`}
          </p>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="pixel-frame min-w-0 bg-[var(--surface)] p-5">
          <h2 className="font-display text-sm leading-relaxed">Pantalla del anfitrión</h2>
          <p className="mt-2 text-[var(--dim)]">
            Crea la sala, proyecta el tablero con el código y el QR, y controla la partida:
            preguntas, tiempos, bonus y resultados.
          </p>
          <button
            type="button"
            onClick={() => create.mutate()}
            disabled={create.isPending}
            className="pixel-frame-sm font-display mt-4 min-h-12 w-full bg-[var(--accent)] px-4 py-3 text-sm text-white"
          >
            Crear sala nueva
          </button>
        </section>

        <section className="pixel-frame min-w-0 bg-[var(--surface)] p-5">
          <h2 className="font-display text-sm leading-relaxed">Unirse como jugador</h2>
          {linkCode ? (
            <p className="pixel-frame-sm mt-2 bg-[#E7F6EC] p-3 font-bold text-[var(--accent-2)]">
              ¡Llegaste por el código QR! La sala {linkCode} ya está puesta: solo escribe tu
              nombre, elige tu abogado y toca «Entrar a la sala».
            </p>
          ) : (
            <p className="mt-2 text-[var(--dim)]">
              Escribe el código que se ve en la pantalla del anfitrión, tu nombre y elige si quieres
              ser abogado o abogada y tu personaje con traje.
            </p>
          )}
          <div className="mt-3 grid min-w-0 gap-2">
            <label className="grid min-w-0 gap-1 text-sm">
              Código de sala
              <input
                aria-label="Código de sala"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Ej. K7PX2A"
                maxLength={6}
                className="pixel-frame-sm font-display min-h-12 w-full min-w-0 bg-[var(--surface-2)] px-3 text-center text-base tracking-[0.3em] uppercase"
              />
            </label>
            <label className="grid min-w-0 gap-1 text-sm">
              Tu nombre o apodo
              <input
                aria-label="Tu nombre o apodo"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="Ej. Ana"
                maxLength={24}
                autoFocus={!!linkCode}
                className="pixel-frame-sm min-h-12 w-full min-w-0 bg-[var(--surface-2)] px-3"
              />
            </label>
            <AvatarPicker value={joinAvatar} onChange={setJoinAvatar} name={joinName} />
            <button
              type="button"
              onClick={() => join.mutate()}
              disabled={join.isPending || joinCode.trim().length < 6 || !joinName.trim()}
              className="pixel-frame-sm font-display min-h-12 w-full bg-[var(--accent-2)] px-4 py-3 text-sm text-white disabled:opacity-40"
            >
              Entrar a la sala
            </button>
          </div>
        </section>
      </div>

      <section className="pixel-frame mt-4 min-w-0 bg-[var(--surface)] p-5">
        <h2 className="font-display text-sm leading-relaxed">¿Sin más dispositivos a la mano?</h2>
        <p className="mt-2 text-[var(--dim)]">
          La demo rápida crea una sala con 4 jugadores simulados, te suma a ti como jugador en la
          misma pantalla y arranca la partida de una vez. Sirve para probar todo el flujo: tablero,
          buzzer, preguntas bonus y resultado final.
        </p>
        <div className="mt-3 grid min-w-0 gap-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="demo-name">
              Tu nombre para la demo
            </label>
            <input
              id="demo-name"
              value={demoName}
              onChange={(e) => setDemoName(e.target.value)}
              placeholder="Tu nombre (opcional)"
              maxLength={24}
              className="pixel-frame-sm min-h-12 min-w-0 flex-1 bg-[var(--surface-2)] px-3"
            />
            <button
              type="button"
              onClick={() => demo.mutate()}
              disabled={demo.isPending}
              className="pixel-frame-sm font-display min-h-12 bg-[var(--surface)] px-5 py-3 text-xs text-[var(--accent)]"
            >
              {demo.isPending ? "Preparando…" : "Jugar demo con simulados"}
            </button>
          </div>
          <AvatarPicker value={demoAvatar} onChange={setDemoAvatar} name={demoName} />
        </div>
      </section>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onInstructions}
          className="pixel-frame-sm font-display min-h-12 bg-[var(--ink)] px-4 py-3 text-xs text-white"
        >
          Instrucciones
        </button>
        <button
          type="button"
          onClick={onBank}
          className="pixel-frame-sm min-h-12 bg-[var(--surface)] px-4 py-3 font-bold"
        >
          Banco de preguntas y categoría Totalsec
        </button>
      </div>

      {error && (
        <p className="pixel-frame-sm mt-3 bg-[#FDE3DF] p-3 text-center font-bold text-[var(--danger)]">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------- App ----------
export function App() {
  const [linkCode] = useState<string | null>(() => linkRoomCode());
  const [session, setSessionState] = useState<Session | null>(() => {
    const stored = loadSession();
    // Si el jugador llega por el QR de OTRA sala, ese enlace manda: la
    // sesión guardada de una partida anterior ya no debe secuestrar la
    // pantalla (antes lo dejaba atrapado en la sala vieja y «no lo dejaba
    // acceder a la sala» nueva).
    if (linkCode && stored && stored.code !== linkCode) {
      try {
        localStorage.removeItem("qlt-session");
      } catch {
        // almacenamiento no disponible
      }
      return null;
    }
    return stored;
  });
  const [showBank, setShowBank] = useState(false);
  // Flujo de entrada: intro estilo SNES → menú (Iniciar / Instrucciones) →
  // pantalla principal. Quien llega por el QR de una sala entra directo a
  // la pantalla principal, sin pasar por el intro.
  const [screen, setScreen] = useState<"intro" | "instructions" | "main">(
    linkCode ? "main" : "intro",
  );
  const [instrFrom, setInstrFrom] = useState<"intro" | "home">("intro");
  const [introAtMenu, setIntroAtMenu] = useState(false);

  const setSession = (s: Session | null) => {
    setSessionState(s);
    try {
      if (s) localStorage.setItem("qlt-session", JSON.stringify(s));
      else localStorage.removeItem("qlt-session");
    } catch {
      // almacenamiento no disponible; la sesión vive solo en memoria
    }
  };
  const exit = () => {
    setSession(null);
    setScreen("main");
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SafeAreaTopScrim backgroundColor="var(--bg)" />
      {showBank ? (
        <BankScreen onBack={() => setShowBank(false)} />
      ) : session?.role === "host" ? (
        <HostScreen session={session} setSession={setSession} onExit={exit} />
      ) : session?.role === "player" ? (
        <PlayerScreen session={session} onExit={exit} />
      ) : screen === "intro" ? (
        <IntroScreen
          initialStep={introAtMenu ? "menu" : "tcs"}
          onStart={() => setScreen("main")}
          onInstructions={() => {
            setInstrFrom("intro");
            setScreen("instructions");
          }}
        />
      ) : screen === "instructions" ? (
        <InstructionsScreen
          onBack={() => {
            if (instrFrom === "intro") {
              setIntroAtMenu(true);
              setScreen("intro");
            } else {
              setScreen("main");
            }
          }}
          onStart={() => setScreen("main")}
        />
      ) : (
        <HomeScreen
          setSession={setSession}
          onBank={() => setShowBank(true)}
          onInstructions={() => {
            setInstrFrom("home");
            setScreen("instructions");
          }}
          linkCode={linkCode}
        />
      )}
    </div>
  );
}
