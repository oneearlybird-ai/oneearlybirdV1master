import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { navigationMocks } from "@/tests/mocks/navigation";

const assignMock = vi.fn();

const apiBaseState = vi.hoisted(() => {
  let current = "";
  return {
    set(value: string) {
      current = value;
    },
    clear() {
      current = "";
    },
    get() {
      return current;
    }
  };
});

vi.mock("@/lib/clientNavigation", () => ({
  redirectTo: assignMock
}));

vi.mock("@/lib/config", () => ({
  get API_BASE() {
    return apiBaseState.get();
  }
}));

type AuthClientType = typeof import("../AuthClient").default;

async function mountAuthClient(
  options: {
    initialTab?: "login" | "signup";
    apiBase?: string | null;
  } = {}
) {
  const { initialTab = "login", apiBase } = options;

  if (apiBase === null) {
    apiBaseState.clear();
  } else if (typeof apiBase === "string") {
    apiBaseState.set(apiBase);
  } else {
    apiBaseState.clear();
  }

  const module = await import("../AuthClient");
  const AuthClient = module.default as AuthClientType;
  render(<AuthClient initialTab={initialTab} />);
  return AuthClient;
}

describe("AuthClient email + password flows", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    navigationMocks.reset();
    assignMock.mockReset();
    fetchMock = vi.fn();
    (global as any).fetch = fetchMock;
  });

  afterEach(() => {
    delete (global as any).fetch;
    apiBaseState.clear();
  });

  it("posts login credentials to the API base in production mode with credentials included", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
      headers: new Headers()
    } as Response);

    await mountAuthClient({ apiBase: "https://api.oneearlybird.ai" });

    await user.type(screen.getByLabelText("Email"), "practice@example.com");
    await user.type(screen.getByLabelText("Password"), "Sup3rSecret!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.oneearlybird.ai/auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email: "practice@example.com", password: "Sup3rSecret!" })
      })
    );
    const callbackCalls = fetchMock.mock.calls.filter(
      ([url]) => typeof url === "string" && url.includes("/api/auth/callback/credentials")
    );
    expect(callbackCalls.length).toBe(0);
    expect(assignMock).toHaveBeenCalledWith("/dashboard");
  });

  it("posts login credentials via the preview proxy when NEXT_PUBLIC_API_BASE is not set", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
      headers: new Headers()
    } as Response);

    await mountAuthClient({ apiBase: null });

    await user.type(screen.getByLabelText("Email"), "preview@example.com");
    await user.type(screen.getByLabelText("Password"), "Sup3rSecret!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upstream/auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email: "preview@example.com", password: "Sup3rSecret!" })
      })
    );
    const callbackCalls = fetchMock.mock.calls.filter(
      ([url]) => typeof url === "string" && url.includes("/api/auth/callback/credentials")
    );
    expect(callbackCalls.length).toBe(0);
    expect(assignMock).toHaveBeenCalledWith("/dashboard");
  });

  it("shows a generic error message on 400/401 without leaking backend detail", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: "Detailed backend hint" }),
      headers: new Headers()
    } as Response);

    await mountAuthClient({ apiBase: "https://api.oneearlybird.ai" });

    await user.type(screen.getByLabelText("Email"), "practice@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-pass");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    const errorMessage = await screen.findByText(/Error:/i);
    expect(errorMessage).toHaveTextContent(/Error: login_failed/i);
    expect(errorMessage).not.toHaveTextContent(/Detailed backend hint/i);
    expect(assignMock).not.toHaveBeenCalled();
  });

  it("signs up then logs in with include credentials on successful account creation", async () => {
    const user = userEvent.setup();
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({}),
        headers: new Headers()
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
        headers: new Headers()
      } as Response);

    await mountAuthClient({ initialTab: "signup", apiBase: "https://api.oneearlybird.ai" });

    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "Sup3rSecret!");
    await user.type(screen.getByLabelText("Confirm password"), "Sup3rSecret!");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api.oneearlybird.ai/auth/signup",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email: "new@example.com", password: "Sup3rSecret!" })
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://api.oneearlybird.ai/auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email: "new@example.com", password: "Sup3rSecret!" })
      })
    );
    expect(assignMock).toHaveBeenCalledWith("/dashboard");
  });

  it("still performs login after signup returns conflict (409)", async () => {
    const user = userEvent.setup();
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({}),
        headers: new Headers()
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
        headers: new Headers()
      } as Response);

    await mountAuthClient({ initialTab: "signup", apiBase: "https://api.oneearlybird.ai" });

    await user.type(screen.getByLabelText("Email"), "existing@example.com");
    await user.type(screen.getByLabelText("Password"), "Sup3rSecret!");
    await user.type(screen.getByLabelText("Confirm password"), "Sup3rSecret!");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const loginCall = fetchMock.mock.calls[1];
    expect(loginCall?.[0]).toBe("https://api.oneearlybird.ai/auth/login");
    expect(loginCall?.[1]).toMatchObject({
      credentials: "include",
      method: "POST"
    });
    expect(assignMock).toHaveBeenCalledWith("/dashboard");
  });

  it("keeps sign-up and sign-in button styling in sync", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
      headers: new Headers()
    } as Response);

    await mountAuthClient({ apiBase: "https://api.oneearlybird.ai" });

    const signInButton = screen.getByRole("button", { name: "Sign in" });
    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: "Create account" }));
    const createButton = await screen.findByRole("button", { name: "Create account" });

    expect(signInButton.className).toBe(createButton.className);
  });
});
