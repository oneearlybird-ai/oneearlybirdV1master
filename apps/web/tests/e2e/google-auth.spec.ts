import { expect, test } from "@playwright/test";

const RUN_MANUAL = process.env.RUN_MANUAL_E2E === "1";

test.describe("google auth endpoints", () => {
  test("start endpoint issues OAuth redirect with required params", async ({ request }) => {
    const response = await request.get("https://api.oneearlybird.ai/oauth/google/start", {
      maxRedirects: 0
    });

    expect(response.status()).toBe(302);

    const location = response.headers()["location"];
    expect(location).toBeDefined();

    const redirectUrl = new URL(location!);
    expect(redirectUrl.host).toContain("auth.us-east-1.amazoncognito.com");

    const params = redirectUrl.searchParams;
    const requiredParams = [
      "client_id",
      "redirect_uri",
      "scope",
      "state",
      "nonce",
      "code_challenge",
      "code_challenge_method",
      "response_type"
    ];

    for (const key of requiredParams) {
      expect(params.get(key), `expected '${key}' query param`).toBeTruthy();
    }

    expect(params.get("scope")).toContain("openid");
    expect(params.get("code_challenge_method")).toBe("S256");
    expect(params.get("response_type")).toBe("code");
  });

  const manualTest = RUN_MANUAL ? test : test.skip;

  manualTest("manual callback smoke (requires real Google login)", async () => {
    test.info().annotations.push({
      type: "instructions",
      description:
        "1) Manually complete Google login at https://oneearlybird.ai/login using a browser.\n" +
        "2) In devtools → Network, capture the 302 response from https://api.oneearlybird.ai/oauth/google/callback.\n" +
        "   • Copy the Location header (should point at https://oneearlybird.ai/app) into MANUAL_CALLBACK_LOCATION.\n" +
        "   • Copy the Set-Cookie header lines (mask cookie values; include attributes) into MANUAL_CALLBACK_HEADERS, separated by newlines.\n" +
        "3) Re-run this test with RUN_MANUAL_E2E=1 MANUAL_CALLBACK_LOCATION='<value>' MANUAL_CALLBACK_HEADERS=$'Set-Cookie: id_token=***; ...\\nSet-Cookie: access_token=***; ...\\nSet-Cookie: refresh_token=***; ...'."
    });

    const location = process.env.MANUAL_CALLBACK_LOCATION;
    const rawHeaders = process.env.MANUAL_CALLBACK_HEADERS;

    test.skip(
      !(location && rawHeaders),
      "Set MANUAL_CALLBACK_LOCATION and MANUAL_CALLBACK_HEADERS after performing the manual login flow."
    );

    const redirectUrl = new URL(location!);
    expect(redirectUrl.origin).toBe("https://oneearlybird.ai");
    expect(redirectUrl.pathname).toBe("/app");

    const cookieLines = rawHeaders!
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^set-cookie:/i.test(line))
      .map((line) => line.split(":")[1]?.trim() ?? "");

    expect(cookieLines.length).toBeGreaterThanOrEqual(3);

    const cookieNames = cookieLines.map((line) => line.split("=")[0]);
    expect(cookieNames).toEqual(
      expect.arrayContaining(["id_token", "access_token", "refresh_token"])
    );

    for (const line of cookieLines) {
      expect(line.toLowerCase()).toContain("httponly");
      expect(line.toLowerCase()).toContain("secure");
      expect(line.toLowerCase()).toContain("samesite=lax");
      expect(line.toLowerCase()).toContain("domain=.oneearlybird.ai");
      expect(line.toLowerCase()).toContain("path=/");
    }
  });
});
