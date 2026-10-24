/** "live" (default): the Stellance API. "mock" (`NEXT_PUBLIC_API_SOURCE=mock`): demo data in the browser via @repo/mock-api. */
export const API_SOURCE: "mock" | "live" = process.env.NEXT_PUBLIC_API_SOURCE === "mock" ? "mock" : "live";

export const USE_MOCK_API = API_SOURCE === "mock";

export const DEMO_ADMIN = { email: "admin@usestellance.com", password: "Password1" } as const;
