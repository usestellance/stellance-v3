/** "mock" (default for now): demo data in the browser via @repo/mock-api. "live": the Stellance API. */
export const API_SOURCE: "mock" | "live" = process.env.NEXT_PUBLIC_API_SOURCE === "live" ? "live" : "mock";

export const USE_MOCK_API = API_SOURCE === "mock";

export const DEMO_ADMIN = { email: "admin@usestellance.com", password: "Password1" } as const;
