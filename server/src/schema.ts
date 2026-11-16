// Esquema del Quiz Legal Totalsec.
// rooms: una sala por partida; el estado completo del juego vive como JSON
// en rooms.state (orden de preguntas, pregunta actual, respuestas, bonus).
// players: participantes de una sala (humanos y simulados), con su puntaje.
// custom_questions: preguntas agregadas desde la app (categoría Totalsec),
// pendientes de los datos reales que proporcionará Víctor.

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const rooms = sqliteTable("rooms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  phase: text("phase").notNull().default("lobby"),
  state: text("state").notNull().default("{}"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const players = sqliteTable("players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomId: integer("room_id")
    .notNull()
    .references(() => rooms.id),
  name: text("name").notNull(),
  avatar: text("avatar").notNull().default("h-oscuro"),
  isBot: integer("is_bot").notNull().default(0),
  score: integer("score").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),
  rescuesUsed: integer("rescues_used").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const customQuestions = sqliteTable("custom_questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").notNull().default("Totalsec"),
  difficulty: text("difficulty").notNull().default("Fácil"),
  points: integer("points").notNull().default(5),
  text: text("text").notNull(),
  options: text("options").notNull().default("[]"),
  correct: integer("correct").notNull().default(0),
  explanation: text("explanation").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
