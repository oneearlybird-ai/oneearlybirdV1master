import { vi } from "vitest";

const push = vi.fn();
const replace = vi.fn();
const prefetch = vi.fn();
const refresh = vi.fn();
const back = vi.fn();
const forward = vi.fn();

const router = {
  push,
  replace,
  prefetch,
  refresh,
  back,
  forward
};

let params = new URLSearchParams();

export const navigationMocks = {
  router,
  push,
  replace,
  prefetch,
  refresh,
  back,
  forward,
  reset() {
    push.mockReset();
    replace.mockReset();
    prefetch.mockReset();
    refresh.mockReset();
    back.mockReset();
    forward.mockReset();
    params = new URLSearchParams();
  },
  setSearchParams(value: URLSearchParams) {
    params = value;
  },
  getSearchParams() {
    return params;
  }
};

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  useSearchParams: () => {
    const current = navigationMocks.getSearchParams();
    return {
      entries: () => current.entries(),
      get: current.get.bind(current),
      toString: current.toString.bind(current)
    };
  }
}));
