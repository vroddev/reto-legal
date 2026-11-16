// Servidor autónomo de RETO LEGAL para hospedaje externo (Render).
//
// Dentro de Muse, el daemon propio de la plataforma es quien sirve la app
// y ejecuta las acciones. Este servidor reproduce ese mismo contrato fuera
// de Muse, sin cambiar el juego:
//
//   - Escucha en el puerto de la variable de entorno PORT (Render la
//     inyecta; en local se usa 10000 por defecto).
//   - Sirve el cliente compilado (client/dist) como archivos estáticos.
//   - Atiende POST /actions con el mismo protocolo que usa el cliente
//     ({ action, args } -> { data } | { error }) y ejecuta los handlers
//     reales de server/src/actions.ts contra una base SQLite propia
//     (archivo local; en Render, DATABASE_PATH apunta a /tmp porque el
//     disco del plan gratuito es efímero: las salas son por partida y no
//     necesitan persistencia entre reinicios).
//
// El QR y el enlace de sala no dependen de este servidor: el cliente los
// genera con window.location.origin, así que en Render codifican la URL
// pública real del servicio (p. ej. https://reto-legal.onrender.com).

import { existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import type { Ctx } from "@hatch/space-sdk";
import { Actions } from "../server/src/actions";
import * as schema from "../server/src/schema";

const PORT = Number(process.env.PORT ?? 10000);
const HOST = "0.0.0.0";
const DB_PATH = process.env.DATABASE_PATH ?? "data/reto-legal.db";
const CLIENT_DIR = process.env.CLIENT_DIR ?? join(process.cwd(), "client", "dist");

// ---------- Base de datos (mismo esquema que las migraciones 0002 y 0003) ----------

if (DB_PATH !== ":memory:") {
  const dir = dirname(DB_PATH);
  if (dir && dir !== ".") mkdirSync(dir, { recursive: true });
}
const sqlite = new Database(DB_PATH, { create: true });
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec(`
CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  phase TEXT NOT NULL DEFAULT 'lobby',
  state TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL REFERENCES rooms(id),
  name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT 'h-oscuro',
  is_bot INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  rescues_used INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS custom_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL DEFAULT 'Totalsec',
  difficulty TEXT NOT NULL DEFAULT 'Fácil',
  points INTEGER NOT NULL DEFAULT 5,
  text TEXT NOT NULL,
  options TEXT NOT NULL DEFAULT '[]',
  correct INTEGER NOT NULL DEFAULT 0,
  explanation TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);
`);

const db = drizzle(sqlite, { schema });

// Contexto mínimo compatible con el que los handlers esperan: acceso a la
// base con el esquema del juego y un invalidateQueries sin efecto (fuera de
// Muse no hay caché de consultas del lado del servidor que invalidar; el
// cliente sondea getRoom por su cuenta).
const ctx = {
  db: () => db,
  invalidateQueries: () => {},
} as unknown as Ctx;

// ---------- Despacho de acciones ----------

type ActionDef = {
  request: { parse: (value: unknown) => unknown };
  response: { parse: (value: unknown) => unknown };
  handler: (c: Ctx, args: never) => Promise<unknown>;
};
const actionTable = Actions as unknown as Record<string, ActionDef>;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function handleAction(req: Request): Promise<Response> {
  let body: { action?: unknown; args?: unknown };
  try {
    body = (await req.json()) as { action?: unknown; args?: unknown };
  } catch {
    return jsonResponse({ error: "Cuerpo JSON no válido." }, 400);
  }
  const name = typeof body.action === "string" ? body.action : "";
  const def = actionTable[name];
  if (!def) return jsonResponse({ error: `Acción desconocida: ${name}` }, 404);
  try {
    const args = def.request.parse(body.args ?? {});
    const result = await (def.handler as (c: Ctx, a: unknown) => Promise<unknown>)(ctx, args);
    const data = def.response.parse(result);
    return jsonResponse({ data }, 200);
  } catch (err) {
    console.error(`[actions] ${name} falló:`, err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : String(err) },
      500,
    );
  }
}

// ---------- Archivos estáticos del cliente ----------

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

function fileResponse(filePath: string): Response {
  const type = MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream";
  return new Response(Bun.file(filePath), { headers: { "content-type": type } });
}

function staticResponse(pathname: string): Response | null {
  const rel = normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, "");
  const filePath = join(CLIENT_DIR, rel);
  if (!filePath.startsWith(CLIENT_DIR)) return null;
  if (existsSync(filePath) && statSync(filePath).isFile()) return fileResponse(filePath);
  // SPA: cualquier otra ruta GET devuelve la app (el juego lee #sala= del
  // fragmento en el cliente).
  const index = join(CLIENT_DIR, "index.html");
  if (existsSync(index)) return fileResponse(index);
  return null;
}

// ---------- Servidor HTTP ----------

Bun.serve({
  port: PORT,
  hostname: HOST,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/healthz") {
      return new Response("ok", { headers: { "content-type": "text/plain" } });
    }
    if (url.pathname === "/actions" || url.pathname === "/actions/") {
      if (req.method !== "POST") return jsonResponse({ error: "Método no permitido." }, 405);
      return handleAction(req);
    }
    if (req.method === "GET" || req.method === "HEAD") {
      const res = staticResponse(url.pathname);
      if (res) return res;
    }
    return new Response("No encontrado", { status: 404 });
  },
});

console.log(`RETO LEGAL escuchando en http://${HOST}:${PORT} (base de datos: ${DB_PATH})`);
