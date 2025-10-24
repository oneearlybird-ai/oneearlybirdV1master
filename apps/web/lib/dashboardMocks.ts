import type { ApiFetchInit } from "@/lib/http";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_DASHBOARD_MOCKS === "true";

type MockResolver = (
  pathname: string,
  searchParams: URLSearchParams,
  init: ApiFetchInit,
  body: unknown,
) => Response | Promise<Response> | null;

const mockProfile = {
  accountNumber: "ACC-123456",
  firstName: "Taylor",
  lastName: "Mocke",
  displayName: "Taylor from Stellar",
  contactEmail: "taylor.mock@example.com",
  contactPhone: "+15559871234",
  email: "taylor.mock@example.com",
  businessName: "Stellar Coffee Roasters",
  businessPhone: "+15551234567",
  timezone: "America/Los_Angeles",
  addressNormalized: {
    line1: "123 Stellar Ave",
    city: "Portland",
    region: "OR",
    postal: "97205",
    country: "US",
  },
  hours: [
    { day: "monday", open: "08:00", close: "18:00" },
    { day: "tuesday", open: "08:00", close: "18:00" },
  ],
  industry: "Hospitality",
  crm: "HubSpot",
  locations: 2,
  website: "https://stellar-coffee.example",
  businessProfileComplete: true,
  routingMode: "agent",
  agentEnabled: true,
  phoneVerifiedAt: new Date().toISOString(),
  did: "+15558675309",
};

const mockUsageSummary = {
  calls: 128,
  minutes: 364,
  qualified: 42,
  version: "mocked123",
  tenantId: "mock-tenant",
  window: "week",
  usedMinutes: 85,
  monthlyMinutes: 1200,
  minutesCap: 1500,
  concurrencyCap: 4,
  periods: Array.from({ length: 7 }).map((_, idx) => ({
    ts: new Date(Date.now() - (6 - idx) * 24 * 60 * 60 * 1000).toISOString(),
    answered: Math.floor(Math.random() * 18) + 4,
    booked: Math.floor(Math.random() * 6),
    deflected: Math.floor(Math.random() * 3),
    avgDuration: 180 + Math.floor(Math.random() * 120),
  })),
};

const mockBillingSummary = {
  status: "active",
  planKey: "growth",
  planPriceId: "price_mock_growth",
  planMinutes: 1000,
  minutesCap: 1500,
  concurrencyCap: 4,
  trialEnd: null,
  currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  hasPaymentMethod: true,
  trialEligible: false,
};

const mockCalls = [
  {
    id: "call_mock_001",
    ts: new Date().toISOString(),
    from: "+15558675309",
    to: "+15551234567",
    outcome: "booked",
    durationSec: 324,
    hasRecording: true,
    hasTranscript: true,
    recordingKey: "mock/recordings/call_mock_001.mp3",
    transcriptKey: "mock/transcripts/call_mock_001.txt",
  },
  {
    id: "call_mock_002",
    ts: new Date(Date.now() - 3600_000).toISOString(),
    from: "+15557654321",
    to: "+15551234567",
    outcome: "qualified",
    durationSec: 210,
    hasRecording: false,
    hasTranscript: false,
    recordingKey: null,
    transcriptKey: null,
  },
  {
    id: "call_mock_003",
    ts: new Date(Date.now() - 2 * 3600_000).toISOString(),
    from: "+15553456789",
    to: "+15551234567",
    outcome: "voicemail",
    durationSec: 95,
    hasRecording: true,
    hasTranscript: false,
    recordingKey: "mock/recordings/call_mock_003.mp3",
    transcriptKey: null,
  },
];

const mockBookings = [
  {
    id: "booking_mock_001",
    ts: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    title: "Consultation with Alex",
    attendee: "Alex Johnson",
    source: "agent",
    status: "scheduled",
    notes: "First-time caller interested in demo.",
  },
  {
    id: "booking_mock_002",
    ts: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    title: "Follow-up with Casey",
    attendee: "Casey Lee",
    source: "dashboard",
    status: "confirmed",
    notes: "Requested more info on pricing tiers.",
  },
];

const mockProviders = [
  { id: "google-calendar", name: "Calendar (Google)", connected: true },
  { id: "hubspot", name: "CRM (HubSpot)", connected: false },
  { id: "slack", name: "Slack", connected: true },
  { id: "salesforce", name: "CRM (Salesforce)", connected: false },
];

function jsonResponse(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

function mockCallsList(body: unknown): Response {
  const payload = typeof body === "string" ? safeJsonParse(body) : body;
  const search = typeof payload?.search === "string" ? payload.search.toLowerCase() : null;
  const items = search
    ? mockCalls.filter((call) => call.id.toLowerCase().includes(search))
    : mockCalls;
  return jsonResponse({ items, nextCursor: null });
}

function mockBookingsList(searchParams: URLSearchParams): Response {
  const windowValue = searchParams.get("window") || "week";
  return jsonResponse({
    items: mockBookings,
    window: windowValue,
  });
}

function safeJsonParse(value: string | undefined | null): any | undefined {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

const resolvers: MockResolver[] = [
  (pathname, searchParams, init) => {
    const method = (init.method || "GET").toUpperCase();
    if (pathname === "/api/dashboard/profile" && method === "GET") {
      return jsonResponse(mockProfile);
    }
    return null;
  },
  (pathname, searchParams, init) => {
    const method = (init.method || "GET").toUpperCase();
    if (pathname === "/api/dashboard/usage" && method === "GET") {
      const windowParam = searchParams.get("window");
      if (windowParam) {
        return jsonResponse({ ...mockUsageSummary, window: windowParam });
      }
      return jsonResponse({
        calls: mockUsageSummary.calls,
        minutes: mockUsageSummary.minutes,
        qualified: mockUsageSummary.qualified,
      });
    }
    return null;
  },
  (pathname, _searchParams, init) => {
    if (pathname === "/billing/summary" && (init.method || "GET").toUpperCase() === "GET") {
      return jsonResponse(mockBillingSummary);
    }
    return null;
  },
  (pathname, _searchParams, init, body) => {
    if (pathname === "/calls/list" && (init.method || "GET").toUpperCase() === "POST") {
      return mockCallsList(body);
    }
    return null;
  },
  (pathname, searchParams, init) => {
    const method = (init.method || "GET").toUpperCase();
    if (pathname === "/bookings/list" && method === "GET") {
      return mockBookingsList(searchParams);
    }
    if (pathname === "/bookings/create" && method === "POST") {
      return jsonResponse({ ok: true, id: "booking_mock_new" }, { status: 201 });
    }
    if (pathname === "/bookings/cancel" && method === "POST") {
      return jsonResponse({ ok: true });
    }
    return null;
  },
  (pathname, _searchParams, init) => {
    const method = (init.method || "GET").toUpperCase();
    if (pathname === "/integrations/status" && method === "GET") {
      return jsonResponse({ providers: mockProviders });
    }
    if (pathname.startsWith("/integrations/oauth/start") && method === "POST") {
      return jsonResponse({ url: "https://example.com/oauth/mock" });
    }
    return null;
  },
  (pathname, _searchParams, init) => {
    const method = (init.method || "GET").toUpperCase();
    if (pathname === "/phone/connect" && method === "POST") {
      return jsonResponse({ ok: true });
    }
    if (pathname === "/phone/verify" && method === "POST") {
      return jsonResponse({ ok: true });
    }
    if (pathname === "/phone/routing" && method === "POST") {
      return jsonResponse({ ok: true });
    }
    if (pathname === "/agent/toggle" && method === "POST") {
      return jsonResponse({ ok: true });
    }
    return null;
  },
  (pathname, _searchParams, init) => {
    const method = (init.method || "GET").toUpperCase();
    if (pathname === "/media/signed-url" && method === "POST") {
      return jsonResponse({ url: "https://cdn.example.com/audio/mock.mp3" });
    }
    if (pathname === "/recordings/item" && method === "GET") {
      return jsonResponse({
        ok: true,
        id: "call_mock_001",
        startedAt: new Date().toISOString(),
        durationSec: 320,
        transcript: "Agent: Hello! Caller: Hi, I wanted to check availability…",
      });
    }
    return null;
  },
  (pathname, _searchParams, init) => {
    const method = (init.method || "GET").toUpperCase();
    if (pathname === "/billing/cancel" && method === "POST") {
      return jsonResponse({ ok: true });
    }
    if (pathname === "/billing/portal" && method === "POST") {
      return jsonResponse({ url: "https://billing.example.com/portal/mock" });
    }
    if (pathname === "/profile/setup" && method === "POST") {
      return jsonResponse({ ok: true });
    }
    if (pathname.startsWith("/places/suggest") && method === "GET") {
      return jsonResponse({
        suggestions: [
          { id: "mock_place_1", name: "Stellar Coffee HQ", description: "123 Stellar Ave, Portland, OR" },
          { id: "mock_place_2", name: "Stellar West", description: "456 Horizon St, Seattle, WA" },
        ],
      });
    }
    if (pathname === "/places/resolve" && method === "POST") {
      return jsonResponse({
        place: {
          addressNormalized: mockProfile.addressNormalized,
          phoneE164: mockProfile.businessPhone,
          website: mockProfile.website,
        },
      });
    }
    return null;
  },
  (pathname, _searchParams, init) => {
    const method = (init.method || "GET").toUpperCase();
    if (pathname === "/auth/account/create" && method === "POST") {
      return jsonResponse({ ok: true, tenantId: "mock-tenant" }, { status: 201 });
    }
    if (pathname.startsWith("/auth/magic/start") && method === "POST") {
      return jsonResponse({ ok: true });
    }
    if (pathname.startsWith("/auth/otp/") && method === "POST") {
      return jsonResponse({ ok: true });
    }
    if (pathname === "/auth/logout" && method === "POST") {
      return new Response(null, { status: 204 });
    }
    return null;
  },
];

function toMockUrl(path: string): URL {
  if (/^https?:\/\//i.test(path)) {
    return new URL(path);
  }
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalised, "https://mock.local");
}

export function shouldUseDashboardMocks(): boolean {
  return USE_MOCKS;
}

export async function getMockResponse(path: string, init: ApiFetchInit = {}): Promise<Response | null> {
  if (!USE_MOCKS) return null;
  const url = toMockUrl(path);
  const body =
    typeof init.body === "string"
      ? safeJsonParse(init.body)
      : init.body instanceof URLSearchParams
        ? Object.fromEntries(init.body.entries())
        : init.body ?? undefined;
  for (const resolver of resolvers) {
    const result = await resolver(url.pathname, url.searchParams, init, body);
    if (result) {
      return result;
    }
  }
  return null;
}
