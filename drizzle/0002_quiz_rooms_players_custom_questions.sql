DROP TABLE entries;
--> statement-breakpoint
CREATE TABLE rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  phase TEXT NOT NULL DEFAULT 'lobby',
  state TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL REFERENCES rooms(id),
  name TEXT NOT NULL,
  is_bot INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  rescues_used INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE custom_questions (
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
