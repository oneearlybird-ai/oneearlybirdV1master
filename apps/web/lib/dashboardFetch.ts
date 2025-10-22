import { apiFetch, type ApiFetchInit } from "@/lib/http";
import { getMockResponse, shouldUseDashboardMocks } from "@/lib/dashboardMocks";

const RETRY_DELAYS_MS = [250, 600];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function dashboardFetch(path: string, init: ApiFetchInit = {}): Promise<Response> {
  if (shouldUseDashboardMocks()) {
    const mock = await getMockResponse(path, init);
    if (mock) {
      return mock;
    }
  }

  let attempt = 0;
  let response: Response | null = null;

  while (attempt <= RETRY_DELAYS_MS.length) {
    response = await apiFetch(path, init);
    if (response.status !== 503) {
      return response;
    }

    if (attempt === RETRY_DELAYS_MS.length) {
      return response;
    }

    await delay(RETRY_DELAYS_MS[attempt]);
    attempt += 1;
  }

  return response!;
}
