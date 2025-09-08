import { Pool } from 'pg';

type GP = { __eb_pg?: Pool; __eb_dsn?: string } & typeof globalThis;
const g = globalThis as GP;

function requireDsn(): string {
  const dsn = process.env.DATABASE_URL ?? '';
  if (!dsn) throw new Error('db_unavailable');
  return dsn;
}

export function pgPool(): Pool {
  const dsn = requireDsn();
  if (!g.__eb_pg || g.__eb_dsn !== dsn) {
    try { g.__eb_pg?.end().catch(() => {}); } catch {}
    const needsSSL = !/localhost|127\.0\.0\.1/.test(dsn);
    g.__eb_pg = new Pool({
      connectionString: dsn,
      ssl: needsSSL ? { rejectUnauthorized: false } : false,
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000
    });
    g.__eb_dsn = dsn;
  }
  return g.__eb_pg!;
}
