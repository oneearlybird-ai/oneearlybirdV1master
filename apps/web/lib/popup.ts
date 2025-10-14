export type PopupOptions = {
  w?: number;
  h?: number;
  expectedMessageType?: string;
  pollInterval?: number;
};

const pendingMessages = new Set<string>();

function buildFeatures(width: number, height: number) {
  const dualScreenLeft = window.screenLeft ?? window.screenX ?? 0;
  const dualScreenTop = window.screenTop ?? window.screenY ?? 0;
  const screenWidth = window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;
  const screenHeight = window.innerHeight ?? document.documentElement.clientHeight ?? screen.height;
  const left = Math.max(0, dualScreenLeft + screenWidth / 2 - width / 2);
  const top = Math.max(0, dualScreenTop + screenHeight / 2 - height / 2);
  return [
    "toolbar=0",
    "menubar=0",
    "location=0",
    "status=0",
    "resizable=1",
    "scrollbars=1",
    `width=${Math.round(width)}`,
    `height=${Math.round(height)}`,
    `top=${Math.round(top)}`,
    `left=${Math.round(left)}`,
  ].join(",");
}

export function openPopup(url: string, name: string, options: PopupOptions = {}): Window | null {
  const { w = 600, h = 700, expectedMessageType, pollInterval = 2000 } = options;
  const features = buildFeatures(w, h);
  const popup = window.open(url, name, features);
  if (!popup) return null;
  if (expectedMessageType) {
    pendingMessages.add(expectedMessageType);
    const interval = window.setInterval(() => {
      if (!popup || popup.closed) {
        window.clearInterval(interval);
        if (pendingMessages.has(expectedMessageType)) {
          pendingMessages.delete(expectedMessageType);
          window.dispatchEvent(new CustomEvent("popup:fallback", { detail: { type: expectedMessageType } }));
        }
      }
    }, pollInterval);
  }
  popup.focus();
  return popup;
}

export function resolvePopupMessage(type: string) {
  if (pendingMessages.has(type)) {
    pendingMessages.delete(type);
  }
}
