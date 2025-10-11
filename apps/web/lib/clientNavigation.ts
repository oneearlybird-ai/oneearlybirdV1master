export function redirectTo(url: string) {
  if (typeof window !== "undefined" && typeof window.location?.assign === "function") {
    window.location.assign(url);
  }
}
