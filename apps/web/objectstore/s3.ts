import type { ObjectStore } from "../lib/adapters";
export const S3Store: ObjectStore = {
  async put(key, data, contentType) { return `s3://${key}`; },
  async getSignedUrl(key, expiresSeconds) { return `https://s3.example/${encodeURIComponent(key)}?X-Amz-Expires=${expiresSeconds}`; }
};
