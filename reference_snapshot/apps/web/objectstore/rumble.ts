import type { ObjectStore } from "../lib/adapters";
export const RumbleStore: ObjectStore = {
  async put(key, data, contentType) { return `rumble://${key}`; },
  async getSignedUrl(key, expiresSeconds) { return `https://rumble.example/${encodeURIComponent(key)}?exp=${expiresSeconds}`; }
};
