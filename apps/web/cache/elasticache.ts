import type { Cache } from "../lib/adapters";
export const ElastiCache: Cache = {
  async get(k) { return null; },
  async set(k,v,ttlSec) { return; }
};
