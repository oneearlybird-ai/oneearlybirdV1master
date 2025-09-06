export interface LLM { generate(input: string, meta?: Record<string, any>): Promise<string>; }
export interface ASR { transcribe(url: string, opts?: Record<string, any>): Promise<string>; }
export interface TTS { synthesize(text: string, opts?: Record<string, any>): Promise<Uint8Array>; }
export interface VectorStore { upsert(id: string, v: number[], meta?: any): Promise<void>; query(v: number[], k: number): Promise<Array<{id:string,score:number}>>; }
export interface ObjectStore { put(key: string, data: Uint8Array | string, contentType?: string): Promise<string>; getSignedUrl(key: string, expiresSeconds: number): Promise<string>; }
export interface Cache { get<T=any>(k:string): Promise<T|null>; set<T=any>(k:string,v:T,ttlSec:number): Promise<void>; }
export interface Queue { enqueue(name:string,payload:any): Promise<void>; }
export interface Email { send(to:string, subject:string, html:string, options?:Record<string,any>): Promise<void>; }
