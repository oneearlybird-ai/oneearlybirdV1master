import type { Cache } from "../lib/adapters";
export const UpstashCache: Cache = {
  async get(k) { return null; },
  async set(k,v,ttlSec) { return; }
};
