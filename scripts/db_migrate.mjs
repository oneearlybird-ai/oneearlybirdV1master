#!/usr/bin/env node
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import process from 'process';
import pg from 'pg';
import * as dotenv from 'dotenv';

['.env','.env.local','apps/web/.env','apps/web/.env.local']
  .filter(p => fs.existsSync(p))
  .forEach(p => dotenv.config({ path: p, override: true }));

const MIGRATIONS_DIR = 'apps/web/db/migrations';
const TABLE = '_migrations';
const sqlHash = s => crypto.createHash('sha256').update(s).digest('hex');

async function getClient() {
  const url = process.env.DATABASE_URL || '';
  if (!url) { console.error('❌ DATABASE_URL not set (checked .env, .env.local, apps/web/.env, apps/web/.env.local)'); process.exit(2); }
  const client = new pg.Client({ connectionString: url, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false } });
  await client.connect();
  return client;
}

async function ensureTable(client) {
  await client.query(`CREATE TABLE IF NOT EXISTS ${TABLE} (id text PRIMARY KEY, hash text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())`);
}

function listMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort()
    .map(f => ({ id: f, path: path.join(MIGRATIONS_DIR, f), sql: fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8') }));
}

async function status() {
  const client = await getClient(); await ensureTable(client);
  const { rows } = await client.query(`SELECT id, hash, applied_at FROM ${TABLE} ORDER BY id`);
  const applied = new Map(rows.map(r => [r.id, r]));
  for (const m of listMigrations()) {
    const h = sqlHash(m.sql); const a = applied.get(m.id);
    if (a && a.hash === h) console.log(`✅ ${m.id} (applied ${new Date(a.applied_at).toISOString()})`);
    else if (a && a.hash !== h) console.log(`❌ ${m.id} (hash changed)`);
    else console.log(`⬜ ${m.id} (pending)`);
  }
  await client.end();
}

async function up() {
  const client = await getClient(); await ensureTable(client);
  const { rows } = await client.query(`SELECT id, hash FROM ${TABLE}`); const applied = new Map(rows.map(r => [r.id, r.hash]));
  for (const m of listMigrations()) {
    const h = sqlHash(m.sql);
    if (applied.get(m.id) === h) { console.log(`✔︎ skip ${m.id}`); continue; }
    console.log(`→ applying ${m.id}`);
    try {
      await client.query('BEGIN');
      await client.query(m.sql);
      await client.query(`INSERT INTO ${TABLE} (id, hash) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET hash=EXCLUDED.hash, applied_at=now()`, [m.id, h]);
      await client.query('COMMIT');
      console.log(`✅ applied ${m.id}`);
    } catch (e) {
      await client.query('ROLLBACK');
      console.error(`❌ failed ${m.id}:`, e.message);
      await client.end();
      process.exit(1);
    }
  }
  await client.end();
  console.log('✅ ALL MIGRATIONS UP');
}

const cmd = process.argv[2] || 'status';
if (cmd === 'status') status();
else if (cmd === 'up') up();
else { console.error('Usage: node scripts/db_migrate.mjs [status|up]'); process.exit(2); }
