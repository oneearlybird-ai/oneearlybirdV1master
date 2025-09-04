/**
 * Centralized env loader with compile-time types and runtime checks.
 * Never import process.env directly elsewhere.
 */
type NonEmpty<T extends string> = T extends '' ? never : T;

function req(key: string): string {
  const v = process.env[key];
  if (!v) {
    throw new Error(`[env] Missing required env var: ${key}`);
  }
  return v;
}

export const Env = {
  // Required now
  TWILIO_ACCOUNT_SID: req('TWILIO_ACCOUNT_SID') as NonEmpty<string>,
  TWILIO_AUTH_TOKEN: req('TWILIO_AUTH_TOKEN') as NonEmpty<string>,

  // Optional for future features
  TWILIO_API_KEY_SID: process.env.TWILIO_API_KEY_SID ?? '',
  TWILIO_API_KEY_SECRET: process.env.TWILIO_API_KEY_SECRET ?? '',

  // App
  APP_BASE_URL: process.env.APP_BASE_URL ?? 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;
