export interface LLM { generate(input: string, meta?: Record<string, unknown>): Promise<string>; }
export interface ASR { transcribe(url: string, opts?: Record<string, unknown>): Promise<string>; }
export interface TTS { synthesize(text: string, opts?: Record<string, unknown>): Promise<Uint8Array>; }
export interface VectorStore {
  upsert(id: string, v: number[], meta?: Record<string, unknown>): Promise<void>;
  query(v: number[], k: number): Promise<Array<{ id: string; score: number }>>;
}
export interface ObjectStore {
  put(key: string, data: Uint8Array | string, contentType?: string): Promise<string>;
  getSignedUrl(key: string, expiresSeconds: number): Promise<string>;
}
export interface Cache { get<T = unknown>(k: string): Promise<T | null>; set<T = unknown>(k: string, v: T, ttlSec: number): Promise<void>; }
export interface Queue { enqueue(name: string, payload: Record<string, unknown>): Promise<void>; }
export interface Email { send(to: string, subject: string, html: string, options?: Record<string, unknown>): Promise<void>; }
