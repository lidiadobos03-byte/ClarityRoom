import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { config } from './config.js';

fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });

export const db = new DatabaseSync(config.databasePath);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('client', 'guide')),
    alias TEXT NOT NULL,
    stripe_account_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ledger_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL CHECK (amount != 0),
    reason TEXT NOT NULL,
    reference_type TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, reference_type, reference_id)
  );

  CREATE TABLE IF NOT EXISTS stripe_events (
    event_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    processed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES users(id),
    topic TEXT NOT NULL,
    summary TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS request_unlocks (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL REFERENCES requests(id),
    guide_id TEXT NOT NULL REFERENCES users(id),
    message TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'interested',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(request_id, guide_id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL UNIQUE REFERENCES requests(id),
    client_id TEXT NOT NULL REFERENCES users(id),
    guide_id TEXT NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'scheduled',
    scheduled_for TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 50,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS session_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id),
    sender_id TEXT NOT NULL REFERENCES users(id),
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS session_message_reads (
    session_id TEXT NOT NULL REFERENCES sessions(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    last_read_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_read_rowid INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (session_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS guide_earnings (
    id TEXT PRIMARY KEY,
    guide_id TEXT NOT NULL REFERENCES users(id),
    session_id TEXT REFERENCES sessions(id),
    amount_pence INTEGER NOT NULL CHECK (amount_pence >= 0),
    platform_fee_pence INTEGER NOT NULL DEFAULT 0 CHECK (platform_fee_pence >= 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'available', 'paid', 'cancelled')),
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    token_hash TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

function addColumnIfMissing(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some(item => item.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

addColumnIfMissing('requests', 'category', "TEXT NOT NULL DEFAULT 'Work pressure'");
addColumnIfMissing('requests', 'preferred_time', "TEXT NOT NULL DEFAULT 'Flexible'");
addColumnIfMissing('requests', 'duration_minutes', 'INTEGER NOT NULL DEFAULT 50');
addColumnIfMissing('request_unlocks', 'message', "TEXT NOT NULL DEFAULT ''");
addColumnIfMissing('request_unlocks', 'status', "TEXT NOT NULL DEFAULT 'interested'");
addColumnIfMissing('session_message_reads', 'last_read_rowid', 'INTEGER NOT NULL DEFAULT 0');

db.prepare(`
  INSERT OR IGNORE INTO ledger_entries
    (id, user_id, amount, reason, reference_type, reference_id)
  SELECT
    lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
    substr(lower(hex(randomblob(2))), 2) || '-' ||
    substr('89ab', abs(random()) % 4 + 1, 1) ||
    substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))),
    id,
    30,
    'Founding member welcome credits',
    'welcome_grant',
    id
  FROM users
`).run();

db.prepare(`
  UPDATE ledger_entries
  SET amount = 30
  WHERE reference_type = 'welcome_grant' AND amount != 30
`).run();

export function balanceFor(userId) {
  return db.prepare('SELECT COALESCE(SUM(amount), 0) AS balance FROM ledger_entries WHERE user_id = ?').get(userId).balance;
}

export function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    alias: user.alias,
    stripeAccountId: user.stripe_account_id,
    balance: balanceFor(user.id),
  };
}
