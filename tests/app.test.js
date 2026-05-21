import { describe, expect, it } from "vitest";
import { buildPexelsEndpoint, getPexelsErrorMessage } from "../app.js";

describe("buildPexelsEndpoint", () => {
  it("builds curated endpoint by default", () => {
    const endpoint = buildPexelsEndpoint({
      searchTerm: "",
      perPage: 20,
      page: 2,
    });
    const url = new URL(endpoint);

    expect(url.pathname).toBe("/v1/curated");
    expect(url.searchParams.get("per_page")).toBe("20");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("query")).toBeNull();
  });

  it("builds search endpoint with query", () => {
    const endpoint = buildPexelsEndpoint({
      searchTerm: "ocean",
      perPage: 30,
      page: 1,
    });
    const url = new URL(endpoint);

    expect(url.pathname).toBe("/v1/search");
    expect(url.searchParams.get("query")).toBe("ocean");
    expect(url.searchParams.get("per_page")).toBe("30");
    expect(url.searchParams.get("page")).toBe("1");
  });
});

describe("getPexelsErrorMessage", () => {
  it("returns auth error message for 401", () => {
    expect(getPexelsErrorMessage(401)).toMatch(/authorization/i);
  });

  it("returns rate limit message for 429", () => {
    expect(getPexelsErrorMessage(429)).toMatch(/rate limit/i);
  });

  it("returns server message for 500", () => {
    expect(getPexelsErrorMessage(500)).toMatch(/unavailable/i);
  });

  it("returns fallback message for other codes", () => {
    expect(getPexelsErrorMessage(418)).toMatch(/418/);
  });
});
