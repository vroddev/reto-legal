// Acciones del Quiz Legal Totalsec.
//
// El estado de cada partida vive en el servidor (tabla rooms, JSON en
// rooms.state) para que el anfitrión y los celulares de los jugadores vean
// lo mismo sondeando getRoom. La respuesta correcta NUNCA sale del servidor
// durante la fase de respuesta: solo se revela en la fase 'reveal'.
//
// Reglas implementadas (acordadas con Víctor):
// - 1 a 10 jugadores, partida de 15 preguntas al azar, al menos 1 por categoría.
// - Fácil 5 pts, media 10 pts, difícil 15 pts. Bonus rapidez +5 (<10 s),
//   racha de 3 aciertos +5. Sin puntos negativos. Meta: 100 puntos.
// - Rescate: tras la pregunta 5 y la 10, si el último va 25+ pts detrás del
//   líder, juega solo una pregunta muy fácil que vale 10 pts (máx. 2 por jugador).
// - Bonus divertido: en un momento aleatorio de la partida, un jugador al
//   azar juega solo una pregunta ligera que vale 10 pts.
// - Empate al final: desempate por buzzer entre los empatados.

import { defineAction, z, type ActionsModule, type Ctx } from "@hatch/space-sdk";
import { asc, eq } from "drizzle-orm";
import * as schema from "./schema";
import { BANK, CATEGORIES, type BankQuestion } from "./bank";
import { FUN_QUESTIONS, RESCUE_QUESTIONS, type BonusQuestion } from "./bonus";

// ---------- Tipos de estado ----------

type QKind = "normal" | "rescue" | "fun" | "tiebreak";

type QSnapshot = {
  key: string;
  kind: QKind;
  category: string;
  difficulty: string;
  points: number;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
};

type GameState = {
  order: string[];
  currentIndex: number;
  current: QSnapshot | null;
  startedAt: number | null;
  answers: Record<string, { choice: number; at: number }>;
  targetPlayerId: number | null;
  pendingBonus: "rescue" | "fun" | null;
  funAfter: number[];
  funUsed: boolean;
  lastGains: Record<string, number>;
  lastCorrect: Record<string, boolean>;
  buzzerPlayerId: number | null;
  tiedIds: number[];
  winnerId: number | null;
};

function initialState(): GameState {
  return {
    order: [],
    currentIndex: 0,
    current: null,
    startedAt: null,
    answers: {},
    targetPlayerId: null,
    pendingBonus: null,
    funAfter: [],
    funUsed: false,
    lastGains: {},
    lastCorrect: {},
    buzzerPlayerId: null,
    tiedIds: [],
    winnerId: null,
  };
}

type RoomRow = typeof schema.rooms.$inferSelect;
type PlayerRow = typeof schema.players.$inferSelect;

// ---------- Utilidades ----------

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j] as T;
    a[j] = tmp as T;
  }
  return a;
}

function pick<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)] ?? null;
}

function durationFor(kind: QKind): number {
  if (kind === "rescue") return 20;
  if (kind === "fun") return 15;
  if (kind === "tiebreak") return 15;
  return 30;
}

async function loadRoom(ctx: Ctx, code: string): Promise<RoomRow | null> {
  const db = ctx.db<typeof schema>();
  const rows = await db
    .select()
    .from(schema.rooms)
    .where(eq(schema.rooms.code, code.toUpperCase().trim()))
    .limit(1);
  return rows[0] ?? null;
}

async function loadPlayers(ctx: Ctx, roomId: number): Promise<PlayerRow[]> {
  const db = ctx.db<typeof schema>();
  return db
    .select()
    .from(schema.players)
    .where(eq(schema.players.roomId, roomId))
    .orderBy(asc(schema.players.id));
}

function parseState(room: RoomRow): GameState {
  try {
    const parsed = JSON.parse(room.state) as Partial<GameState>;
    return { ...initialState(), ...parsed };
  } catch {
    return initialState();
  }
}

async function saveRoom(
  ctx: Ctx,
  room: RoomRow,
  phase: string,
  state: GameState,
): Promise<void> {
  const db = ctx.db<typeof schema>();
  await db
    .update(schema.rooms)
    .set({ phase, state: JSON.stringify(state) })
    .where(eq(schema.rooms.id, room.id));
}

async function snapshotForKey(ctx: Ctx, key: string): Promise<QSnapshot | null> {
  if (key.startsWith("b")) {
    const id = Number(key.slice(1));
    const q = BANK.find((b) => b.id === id);
    if (!q) return null;
    return {
      key,
      kind: "normal",
      category: q.category,
      difficulty: q.difficulty,
      points: q.points,
      text: q.text,
      options: q.options,
      correct: q.correct,
      explanation: q.explanation,
    };
  }
  const id = Number(key.slice(1));
  const db = ctx.db<typeof schema>();
  const rows = await db
    .select()
    .from(schema.customQuestions)
    .where(eq(schema.customQuestions.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  let options: string[] = [];
  try {
    options = JSON.parse(row.options) as string[];
  } catch {
    options = [];
  }
  return {
    key,
    kind: "normal",
    category: row.category,
    difficulty: row.difficulty,
    points: row.points,
    text: row.text,
    options,
    correct: row.correct,
    explanation: row.explanation,
  };
}

function bonusSnapshot(kind: "rescue" | "fun", q: BonusQuestion): QSnapshot {
  return {
    key: `${kind}-${Math.floor(Math.random() * 1e9)}`,
    kind,
    category: kind === "rescue" ? "Pregunta de Rescate" : "Bonus divertido",
    difficulty: kind === "rescue" ? "Muy fácil" : "Divertida",
    points: 10,
    text: q.text,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation,
  };
}

function tiebreakSnapshot(): QSnapshot {
  const hard = BANK.filter((q) => q.difficulty === "Difícil");
  const q = pick(hard) as BankQuestion;
  return {
    key: `tb-${q.id}`,
    kind: "tiebreak",
    category: q.category,
    difficulty: q.difficulty,
    points: 0,
    text: q.text,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation,
  };
}

type ScoreLike = { id: number; score: number; rescuesUsed: number };

function rescueCandidate(players: ScoreLike[]): number | null {
  if (players.length < 2) return null;
  const leader = Math.max(...players.map((p) => p.score));
  const cands = players.filter(
    (p) => leader - p.score >= 25 && p.rescuesUsed < 2,
  );
  if (cands.length === 0) return null;
  const min = Math.min(...cands.map((p) => p.score));
  const lowest = cands.filter((p) => p.score === min);
  return pick(lowest)?.id ?? null;
}

// ---------- Esquemas de respuesta compartidos ----------

const okResponse = z.object({ ok: z.boolean(), message: z.string() });

const playerOut = z.object({
  id: z.number(),
  name: z.string(),
  avatar: z.string(),
  isBot: z.boolean(),
  score: z.number(),
  streak: z.number(),
  correctCount: z.number(),
  rescuesUsed: z.number(),
  answered: z.boolean(),
  lastGain: z.number(),
  lastCorrect: z.boolean().nullable(),
  answerChoice: z.number().nullable(),
});

const questionOut = z
  .object({
    kind: z.string(),
    category: z.string(),
    difficulty: z.string(),
    points: z.number(),
    text: z.string(),
    options: z.array(z.string()),
    correct: z.number().nullable(),
    explanation: z.string().nullable(),
    durationSec: z.number(),
  })
  .nullable();

const roomResponse = z.object({
  ok: z.boolean(),
  message: z.string(),
  code: z.string(),
  phase: z.string(),
  currentNumber: z.number(),
  totalQuestions: z.number(),
  startedAt: z.number().nullable(),
  targetPlayerId: z.number().nullable(),
  buzzerPlayerId: z.number().nullable(),
  winnerId: z.number().nullable(),
  pendingBonus: z.string().nullable(),
  tiedIds: z.array(z.number()),
  players: z.array(playerOut),
  question: questionOut,
});

type RoomResponse = z.infer<typeof roomResponse>;

function emptyRoom(message: string): RoomResponse {
  return {
    ok: false,
    message,
    code: "",
    phase: "none",
    currentNumber: 0,
    totalQuestions: 0,
    startedAt: null,
    targetPlayerId: null,
    buzzerPlayerId: null,
    winnerId: null,
    pendingBonus: null,
    tiedIds: [],
    players: [],
    question: null,
  };
}

function toRoomResponse(
  room: RoomRow,
  players: PlayerRow[],
  state: GameState,
): RoomResponse {
  const reveal = room.phase === "reveal" || room.phase === "finished";
  const cur = state.current;
  return {
    ok: true,
    message: "",
    code: room.code,
    phase: room.phase,
    currentNumber:
      state.order.length === 0 ? 0 : Math.min(state.currentIndex + 1, state.order.length),
    totalQuestions: state.order.length,
    startedAt: state.startedAt,
    targetPlayerId: state.targetPlayerId,
    buzzerPlayerId: state.buzzerPlayerId,
    winnerId: state.winnerId,
    pendingBonus: state.pendingBonus,
    tiedIds: state.tiedIds,
    players: players.map((p) => {
      const ans = state.answers[String(p.id)];
      return {
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isBot: p.isBot === 1,
        score: p.score,
        streak: p.streak,
        correctCount: p.correctCount,
        rescuesUsed: p.rescuesUsed,
        answered: ans != null,
        lastGain: state.lastGains[String(p.id)] ?? 0,
        lastCorrect:
          state.lastCorrect[String(p.id)] != null
            ? (state.lastCorrect[String(p.id)] as boolean)
            : null,
        answerChoice: reveal && ans ? ans.choice : null,
      };
    }),
    question: cur
      ? {
          kind: cur.kind,
          category: cur.category,
          difficulty: cur.difficulty,
          points: cur.points,
          text: cur.text,
          options: cur.options,
          correct: reveal ? cur.correct : null,
          explanation: reveal ? cur.explanation : null,
          durationSec: durationFor(cur.kind),
        }
      : null,
  };
}

// ---------- Acciones ----------

const BOT_NAMES = [
  "Bot Atlas",
  "Bot Lex",
  "Bot Norma",
  "Bot Cifra",
  "Bot Juicio",
  "Bot Vega",
  "Bot Ríos",
  "Bot Sosa",
  "Bot Miranda",
  "Bot Código",
];

export const Actions = {
  createRoom: defineAction({
    description: "Crea una sala de juego nueva y devuelve su código de 6 caracteres.",
    request: z.object({}),
    response: z.object({
      ok: z.boolean(),
      message: z.string(),
      code: z.string(),
    }),
    async handler(ctx) {
      const db = ctx.db<typeof schema>();
      const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
      for (let attempt = 0; attempt < 10; attempt++) {
        let code = "";
        for (let i = 0; i < 6; i++) {
          code += alphabet[Math.floor(Math.random() * alphabet.length)];
        }
        const existing = await loadRoom(ctx, code);
        if (existing) continue;
        await db.insert(schema.rooms).values({
          code,
          phase: "lobby",
          state: JSON.stringify(initialState()),
        });
        ctx.invalidateQueries();
        return { ok: true, message: "Sala creada.", code };
      }
      return { ok: false, message: "No se pudo generar un código de sala.", code: "" };
    },
  }),

  joinRoom: defineAction({
    description: "Une a un jugador humano a una sala en espera usando su código.",
    request: z.object({
      code: z.string().min(4).max(10),
      name: z.string().min(1).max(24),
      avatar: z
        .enum([
          "h-oscuro",
          "m-blazer",
          "h-lentes",
          "m-chongo",
          "h-joven",
          "h-lentes-sol",
          "m-lentes",
          "sin-pelo",
        ])
        .optional()
        .default("h-oscuro"),
    }),
    response: z.object({
      ok: z.boolean(),
      message: z.string(),
      playerId: z.number().nullable(),
    }),
    async handler(ctx, args) {
      const room = await loadRoom(ctx, args.code);
      if (!room) return { ok: false, message: "No existe una sala con ese código.", playerId: null };
      if (room.phase !== "lobby")
        return { ok: false, message: "Esa partida ya comenzó; pide al anfitrión una sala nueva.", playerId: null };
      const players = await loadPlayers(ctx, room.id);
      if (players.length >= 10)
        return { ok: false, message: "La sala ya tiene 10 jugadores.", playerId: null };
      const name = args.name.trim();
      if (!name) return { ok: false, message: "Escribe tu nombre o apodo.", playerId: null };
      const db = ctx.db<typeof schema>();
      const inserted = await db
        .insert(schema.players)
        .values({ roomId: room.id, name, avatar: args.avatar, isBot: 0 })
        .returning({ id: schema.players.id });
      ctx.invalidateQueries();
      return { ok: true, message: `Te uniste a la sala ${room.code}.`, playerId: inserted[0]?.id ?? null };
    },
  }),

  addBot: defineAction({
    description: "Agrega un jugador simulado (bot) a una sala en espera.",
    request: z.object({ code: z.string().min(4).max(10) }),
    response: okResponse,
    async handler(ctx, args) {
      const room = await loadRoom(ctx, args.code);
      if (!room) return { ok: false, message: "La sala no existe." };
      if (room.phase !== "lobby") return { ok: false, message: "La partida ya comenzó." };
      const players = await loadPlayers(ctx, room.id);
      if (players.length >= 10) return { ok: false, message: "La sala ya tiene 10 jugadores." };
      const used = new Set(players.map((p) => p.name));
      const name = BOT_NAMES.find((n) => !used.has(n)) ?? `Bot ${players.length + 1}`;
      const AVATARS = [
        "h-oscuro",
        "m-blazer",
        "h-lentes",
        "m-chongo",
        "h-joven",
        "h-lentes-sol",
        "m-lentes",
        "sin-pelo",
      ];
      const avatar = AVATARS[players.length % AVATARS.length] as string;
      const db = ctx.db<typeof schema>();
      await db.insert(schema.players).values({ roomId: room.id, name, avatar, isBot: 1 });
      ctx.invalidateQueries();
      return { ok: true, message: `${name} se unió a la sala.` };
    },
  }),

  removePlayer: defineAction({
    description: "Quita a un jugador de una sala que aún está en espera.",
    request: z.object({
      code: z.string().min(4).max(10),
      playerId: z.number().int(),
    }),
    response: okResponse,
    async handler(ctx, args) {
      const room = await loadRoom(ctx, args.code);
      if (!room) return { ok: false, message: "La sala no existe." };
      if (room.phase !== "lobby") return { ok: false, message: "La partida ya comenzó." };
      const db = ctx.db<typeof schema>();
      await db
        .delete(schema.players)
        .where(eq(schema.players.id, args.playerId));
      ctx.invalidateQueries();
      return { ok: true, message: "Jugador eliminado de la sala." };
    },
  }),

  getRoom: defineAction({
    description: "Devuelve el estado completo y actualizado de una sala (tablero, jugadores y pregunta actual sin revelar la respuesta).",
    request: z.object({ code: z.string().min(4).max(10) }),
    response: roomResponse,
    async handler(ctx, args): Promise<RoomResponse> {
      const room = await loadRoom(ctx, args.code);
      if (!room) return emptyRoom("No existe una sala con ese código.");
      const players = await loadPlayers(ctx, room.id);
      return toRoomResponse(room, players, parseState(room));
    },
  }),

  startGame: defineAction({
    description: "Inicia la partida: elige 15 preguntas al azar (al menos 1 por categoría) y abre la primera.",
    request: z.object({ code: z.string().min(4).max(10) }),
    response: okResponse,
    async handler(ctx, args) {
      const room = await loadRoom(ctx, args.code);
      if (!room) return { ok: false, message: "La sala no existe." };
      if (room.phase !== "lobby") return { ok: false, message: "La partida ya comenzó." };
      const players = await loadPlayers(ctx, room.id);
      if (players.length < 1)
        return { ok: false, message: "Se necesita al menos 1 jugador para empezar." };

      const db = ctx.db<typeof schema>();
      const customs = await db.select().from(schema.customQuestions);
      const pool: { key: string; category: string }[] = [
        ...BANK.map((q) => ({ key: `b${q.id}`, category: q.category })),
        ...customs.map((q) => ({ key: `c${q.id}`, category: q.category })),
      ];
      const byCat = new Map<string, string[]>();
      for (const item of pool) {
        const list = byCat.get(item.category) ?? [];
        list.push(item.key);
        byCat.set(item.category, list);
      }
      const chosen: string[] = [];
      for (const cat of CATEGORIES) {
        const list = byCat.get(cat);
        if (list && list.length > 0) {
          const one = pick(shuffle(list));
          if (one) chosen.push(one);
        }
      }
      const rest = shuffle(pool.map((p) => p.key).filter((k) => !chosen.includes(k)));
      while (chosen.length < 15 && rest.length > 0) {
        const next = rest.pop();
        if (next) chosen.push(next);
      }
      const order = shuffle(chosen).slice(0, 15);

      const funCandidates = [2, 6, 11].filter((i) => i < order.length - 1);
      const funAfter = funCandidates.length > 0 ? [pick(funCandidates) as number] : [];

      // Reinicia puntajes.
      for (const p of players) {
        await db
          .update(schema.players)
          .set({ score: 0, streak: 0, correctCount: 0, rescuesUsed: 0 })
          .where(eq(schema.players.id, p.id));
      }

      const state = initialState();
      state.order = order;
      state.funAfter = funAfter;
      state.currentIndex = 0;
      const firstKey = order[0];
      if (!firstKey) return { ok: false, message: "No hay preguntas disponibles." };
      state.current = await snapshotForKey(ctx, firstKey);
      state.startedAt = Date.now();
      await saveRoom(ctx, room, "question", state);
      ctx.invalidateQueries();
      return { ok: true, message: "¡La partida comenzó!" };
    },
  }),

  submitAnswer: defineAction({
    description: "Registra la respuesta de un jugador a la pregunta actual.",
    request: z.object({
      code: z.string().min(4).max(10),
      playerId: z.number().int(),
      choice: z.number().int().min(0).max(3),
    }),
    response: okResponse,
    async handler(ctx, args) {
      const room = await loadRoom(ctx, args.code);
      if (!room) return { ok: false, message: "La sala no existe." };
      if (room.phase !== "question")
        return { ok: false, message: "Ahora no se aceptan respuestas." };
      const state = parseState(room);
      const cur = state.current;
      if (!cur) return { ok: false, message: "No hay pregunta activa." };
      const players = await loadPlayers(ctx, room.id);
      const player = players.find((p) => p.id === args.playerId);
      if (!player) return { ok: false, message: "Ese jugador no está en la sala." };
      if (cur.kind !== "normal" && state.targetPlayerId !== args.playerId)
        return { ok: false, message: "Esta pregunta es solo para el jugador elegido." };
      if (args.choice >= cur.options.length)
        return { ok: false, message: "Opción no válida." };
      if (state.answers[String(args.playerId)])
        return { ok: false, message: "Ya registraste tu respuesta." };
      state.answers[String(args.playerId)] = { choice: args.choice, at: Date.now() };
      await saveRoom(ctx, room, room.phase, state);
      ctx.invalidateQueries();
      return { ok: true, message: "Respuesta registrada." };
    },
  }),

  buzz: defineAction({
    description: "Registra qué jugador empatado presionó primero el buzzer en el desempate.",
    request: z.object({
      code: z.string().min(4).max(10),
      playerId: z.number().int(),
    }),
    response: okResponse,
    async handler(ctx, args) {
      const room = await loadRoom(ctx, args.code);
      if (!room) return { ok: false, message: "La sala no existe." };
      if (room.phase !== "buzz")
        return { ok: false, message: "El buzzer no está activo." };
      const state = parseState(room);
      if (!state.tiedIds.includes(args.playerId))
        return { ok: false, message: "Solo los jugadores empatados pueden usar el buzzer." };
      if (state.buzzerPlayerId != null)
        return { ok: false, message: "Otro jugador presionó primero." };
      state.buzzerPlayerId = args.playerId;
      state.targetPlayerId = args.playerId;
      state.answers = {};
      state.startedAt = Date.now();
      await saveRoom(ctx, room, "question", state);
      ctx.invalidateQueries();
      return { ok: true, message: "¡Buzz! Te toca responder." };
    },
  }),

  botPlay: defineAction({
    description: "Hace que los jugadores simulados respondan la pregunta actual (lo invoca la pantalla del anfitrión).",
    request: z.object({ code: z.string().min(4).max(10) }),
    response: okResponse,
    async handler(ctx, args) {
      const room = await loadRoom(ctx, args.code);
      if (!room) return { ok: false, message: "La sala no existe." };
      if (room.phase !== "question") return { ok: false, message: "Sin pregunta activa." };
      const state = parseState(room);
      const cur = state.current;
      if (!cur) return { ok: false, message: "Sin pregunta activa." };
      const players = await loadPlayers(ctx, room.id);
      const startedAt = state.startedAt ?? Date.now();
      let changed = false;
      for (const p of players) {
        if (p.isBot !== 1) continue;
        if (state.answers[String(p.id)]) continue;
        if (cur.kind !== "normal" && state.targetPlayerId !== p.id) continue;
        const pCorrect = cur.kind === "normal" ? 0.62 : 0.85;
        const isCorrect = Math.random() < pCorrect;
        let choice = cur.correct;
        if (!isCorrect) {
          const wrong = cur.options.map((_, i) => i).filter((i) => i !== cur.correct);
          choice = pick(wrong) ?? cur.correct;
        }
        const elapsed =
          cur.kind === "normal"
            ? 2500 + Math.floor(Math.random() * 18500)
            : 2000 + Math.floor(Math.random() * 7000);
        state.answers[String(p.id)] = { choice, at: startedAt + elapsed };
        changed = true;
      }
      if (changed) {
        await saveRoom(ctx, room, room.phase, state);
        ctx.invalidateQueries();
      }
      return { ok: true, message: changed ? "Los bots respondieron." : "Sin cambios." };
    },
  }),

  botBuzz: defineAction({
    description: "Hace que un jugador simulado empatado presione el buzzer del desempate.",
    request: z.object({ code: z.string().min(4).max(10) }),
    response: okResponse,
    async handler(ctx, args) {
      const room = await loadRoom(ctx, args.code);
      if (!room) return { ok: false, message: "La sala no existe." };
      if (room.phase !== "buzz") return { ok: false, message: "El buzzer no está activo." };
      const state = parseState(room);
      if (state.buzzerPlayerId != null) return { ok: false, message: "Ya hay un buzzer." };
      const players = await loadPlayers(ctx, room.id);
      const tiedBots = players.filter(
        (p) => p.isBot === 1 && state.tiedIds.includes(p.id),
      );
      const bot = pick(tiedBots);
      if (!bot) return { ok: false, message: "Ningún bot está empatado." };
      state.buzzerPlayerId = bot.id;
      state.targetPlayerId = bot.id;
      state.answers = {};
      state.startedAt = Date.now();
      await saveRoom(ctx, room, "question", state);
      ctx.invalidateQueries();
      return { ok: true, message: `${bot.name} presionó el buzzer.` };
    },
  }),

  advance: defineAction({
    description: "Avanza el juego: 'reveal' califica la pregunta actual y 'next' pasa a la siguiente pregunta, bonus o resultado final.",
    request: z.object({
      code: z.string().min(4).max(10),
      to: z.enum(["reveal", "next"]),
    }),
    response: okResponse,
    async handler(ctx, args) {
      const room = await loadRoom(ctx, args.code);
      if (!room) return { ok: false, message: "La sala no existe." };
      const db = ctx.db<typeof schema>();
      const state = parseState(room);
      const cur = state.current;

      // ---------- REVELAR Y CALIFICAR ----------
      if (args.to === "reveal") {
        if (room.phase !== "question" || !cur)
          return { ok: false, message: "No hay una pregunta por revelar." };
        const players = await loadPlayers(ctx, room.id);
        const startedAt = state.startedAt ?? Date.now();
        const gains: Record<string, number> = {};
        const correctMap: Record<string, boolean> = {};
        const fresh: ScoreLike[] = [];
        for (const p of players) {
          const ans = state.answers[String(p.id)];
          let gain = 0;
          let isCorrect = false;
          let streak = p.streak;
          let correctCount = p.correctCount;
          if (cur.kind === "normal") {
            if (ans && ans.choice === cur.correct) {
              isCorrect = true;
              gain = cur.points;
              if (ans.at - startedAt < 10000) gain += 5; // bonus rapidez
              streak = p.streak + 1;
              if (streak % 3 === 0) gain += 5; // bonus racha
              correctCount += 1;
            } else {
              streak = 0;
            }
          } else if (p.id === state.targetPlayerId) {
            if (ans && ans.choice === cur.correct) {
              isCorrect = true;
              gain = 10;
              correctCount += 1;
            }
          }
          gains[String(p.id)] = gain;
          correctMap[String(p.id)] = isCorrect;
          fresh.push({ id: p.id, score: p.score + gain, rescuesUsed: p.rescuesUsed });
          await db
            .update(schema.players)
            .set({ score: p.score + gain, streak, correctCount })
            .where(eq(schema.players.id, p.id));
        }
        state.lastGains = gains;
        state.lastCorrect = correctMap;

        if (cur.kind === "tiebreak") {
          const buzzerId = state.buzzerPlayerId;
          if (buzzerId != null && correctMap[String(buzzerId)]) {
            state.winnerId = buzzerId;
          } else {
            if (buzzerId != null)
              state.tiedIds = state.tiedIds.filter((id) => id !== buzzerId);
            if (state.tiedIds.length === 1)
              state.winnerId = state.tiedIds[0] ?? null;
          }
        }

        state.pendingBonus = null;
        if (cur.kind === "normal") {
          const idx = state.currentIndex;
          if ((idx === 4 || idx === 9) && rescueCandidate(fresh) != null) {
            state.pendingBonus = "rescue";
          } else if (state.funAfter.includes(idx) && !state.funUsed) {
            state.pendingBonus = "fun";
          }
        }
        await saveRoom(ctx, room, "reveal", state);
        ctx.invalidateQueries();
        return { ok: true, message: "Respuesta revelada y puntos asignados." };
      }

      // ---------- SIGUIENTE ----------
      if (room.phase !== "reveal" || !cur)
        return { ok: false, message: "Primero revela la respuesta actual." };
      const players = await loadPlayers(ctx, room.id);

      const finishOrTiebreak = async (): Promise<{ ok: boolean; message: string }> => {
        const top = Math.max(...players.map((p) => p.score));
        const leaders = players.filter((p) => p.score === top);
        if (leaders.length <= 1) {
          state.winnerId = leaders[0]?.id ?? null;
          await saveRoom(ctx, room, "finished", state);
        } else {
          state.tiedIds = leaders.map((p) => p.id);
          state.winnerId = null;
          state.current = tiebreakSnapshot();
          state.answers = {};
          state.buzzerPlayerId = null;
          state.targetPlayerId = null;
          state.startedAt = Date.now();
          await saveRoom(ctx, room, "buzz", state);
        }
        ctx.invalidateQueries();
        return { ok: true, message: "Partida terminada." };
      };

      const goNextNormal = async (): Promise<{ ok: boolean; message: string }> => {
        state.currentIndex += 1;
        if (state.currentIndex >= state.order.length) return finishOrTiebreak();
        const key = state.order[state.currentIndex];
        if (!key) return finishOrTiebreak();
        state.current = await snapshotForKey(ctx, key);
        state.answers = {};
        state.targetPlayerId = null;
        state.buzzerPlayerId = null;
        state.pendingBonus = null;
        state.startedAt = Date.now();
        await saveRoom(ctx, room, "question", state);
        ctx.invalidateQueries();
        return { ok: true, message: "Siguiente pregunta." };
      };

      if (state.winnerId != null) {
        await saveRoom(ctx, room, "finished", state);
        ctx.invalidateQueries();
        return { ok: true, message: "Partida terminada." };
      }

      if (cur.kind === "tiebreak") {
        // El que falló sale; los demás empatados vuelven al buzzer.
        state.current = tiebreakSnapshot();
        state.answers = {};
        state.buzzerPlayerId = null;
        state.targetPlayerId = null;
        state.startedAt = Date.now();
        await saveRoom(ctx, room, "buzz", state);
        ctx.invalidateQueries();
        return { ok: true, message: "Nueva pregunta de desempate." };
      }

      if (cur.kind === "rescue" || cur.kind === "fun") {
        return goNextNormal();
      }

      // Pregunta normal: ¿alguien llegó a 100?
      const top = Math.max(...players.map((p) => p.score));
      if (top >= 100) return finishOrTiebreak();

      if (state.pendingBonus === "rescue") {
        const candidateId = rescueCandidate(players);
        if (candidateId != null) {
          const target = players.find((p) => p.id === candidateId);
          if (target) {
            await db
              .update(schema.players)
              .set({ rescuesUsed: target.rescuesUsed + 1 })
              .where(eq(schema.players.id, target.id));
          }
          const q = pick(RESCUE_QUESTIONS) as BonusQuestion;
          state.current = bonusSnapshot("rescue", q);
          state.targetPlayerId = candidateId;
          state.answers = {};
          state.buzzerPlayerId = null;
          state.pendingBonus = null;
          state.startedAt = Date.now();
          await saveRoom(ctx, room, "question", state);
          ctx.invalidateQueries();
          return { ok: true, message: "¡Pregunta de Rescate!" };
        }
        state.pendingBonus = null;
        return goNextNormal();
      }

      if (state.pendingBonus === "fun") {
        state.funUsed = true;
        const target = pick(players);
        const q = pick(FUN_QUESTIONS) as BonusQuestion;
        state.current = bonusSnapshot("fun", q);
        state.targetPlayerId = target?.id ?? null;
        state.answers = {};
        state.buzzerPlayerId = null;
        state.pendingBonus = null;
        state.startedAt = Date.now();
        await saveRoom(ctx, room, "question", state);
        ctx.invalidateQueries();
        return { ok: true, message: "¡Pregunta Bonus divertida!" };
      }

      return goNextNormal();
    },
  }),

  getBankStats: defineAction({
    description: "Devuelve cuántas preguntas jugables hay por categoría, incluida la de Totalsec.",
    request: z.object({}),
    response: z.object({
      categories: z.array(z.object({ name: z.string(), count: z.number() })),
      totalComplete: z.number(),
      totalsecCount: z.number(),
    }),
    async handler(ctx) {
      const db = ctx.db<typeof schema>();
      const customs = await db.select().from(schema.customQuestions);
      const categories = CATEGORIES.map((name) => ({
        name,
        count:
          name === "Totalsec"
            ? customs.length
            : BANK.filter((q) => q.category === name).length,
      }));
      return {
        categories,
        totalComplete: BANK.length + customs.length,
        totalsecCount: customs.length,
      };
    },
  }),

  listCustomQuestions: defineAction({
    description: "Lista las preguntas agregadas desde la app (categoría Totalsec).",
    request: z.object({}),
    response: z.object({
      questions: z.array(
        z.object({
          id: z.number(),
          text: z.string(),
          options: z.array(z.string()),
          correct: z.number(),
          difficulty: z.string(),
          points: z.number(),
          explanation: z.string(),
        }),
      ),
    }),
    async handler(ctx) {
      const db = ctx.db<typeof schema>();
      const rows = await db
        .select()
        .from(schema.customQuestions)
        .orderBy(asc(schema.customQuestions.id));
      return {
        questions: rows.map((r) => {
          let options: string[] = [];
          try {
            options = JSON.parse(r.options) as string[];
          } catch {
            options = [];
          }
          return {
            id: r.id,
            text: r.text,
            options,
            correct: r.correct,
            difficulty: r.difficulty,
            points: r.points,
            explanation: r.explanation,
          };
        }),
      };
    },
  }),

  addCustomQuestion: defineAction({
    description: "Agrega una pregunta de la categoría Totalsec al banco jugable.",
    request: z.object({
      text: z.string().min(5).max(400),
      options: z.array(z.string().min(1).max(200)).length(4),
      correct: z.number().int().min(0).max(3),
      difficulty: z.enum(["Fácil", "Media", "Difícil"]),
      explanation: z.string().max(500).default(""),
    }),
    response: okResponse,
    async handler(ctx, args) {
      const points =
        args.difficulty === "Fácil" ? 5 : args.difficulty === "Media" ? 10 : 15;
      const db = ctx.db<typeof schema>();
      await db.insert(schema.customQuestions).values({
        category: "Totalsec",
        difficulty: args.difficulty,
        points,
        text: args.text.trim(),
        options: JSON.stringify(args.options.map((o) => o.trim())),
        correct: args.correct,
        explanation: args.explanation.trim(),
      });
      ctx.invalidateQueries();
      return { ok: true, message: "Pregunta de Totalsec agregada al banco." };
    },
  }),

  deleteCustomQuestion: defineAction({
    description: "Elimina una pregunta agregada desde la app.",
    request: z.object({ id: z.number().int() }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      await db
        .delete(schema.customQuestions)
        .where(eq(schema.customQuestions.id, args.id));
      ctx.invalidateQueries();
      return { ok: true, message: "Pregunta eliminada." };
    },
  }),
} satisfies ActionsModule;
