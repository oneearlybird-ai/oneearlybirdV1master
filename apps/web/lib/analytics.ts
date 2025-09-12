export function track(name: string, props?: Record<string, unknown>) {
  try {
    if (typeof window === "undefined") return;
    // Minimal, CSP-safe client event emitter (no external scripts)
    window.dispatchEvent(new CustomEvent("analytics", { detail: { name, props } }));
    if (process.env.NODE_ENV !== "production") {
      // dev-only console is acceptable in development builds
      console.debug("analytics", name, props || {});
    }
  } catch {
    return; // swallow errors safely
  }
}
