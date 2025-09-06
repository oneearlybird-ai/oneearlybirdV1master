export type AuditEvent = { type: string; at: string; actor?: string; details?: Record<string, unknown> };
export function makeAuditEvent(type: string, details?: Record<string, unknown>): AuditEvent {
  return { type, at: new Date().toISOString(), details };
}
