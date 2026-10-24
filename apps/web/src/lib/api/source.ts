/**
 * Where the app's data comes from.
 *
 * - "live" (default): the Stellance API.
 * - "mock" (`NEXT_PUBLIC_API_SOURCE=mock`): an in-browser backend (`@repo/mock-api`) with demo data, so every
 *   screen and payment state can be explored without an account or the network. Data lives in localStorage
 *   (`stellance-mock-db`); "Reset demo data" on the sign-in page restores it.
 */
export const API_SOURCE: "mock" | "live" = process.env.NEXT_PUBLIC_API_SOURCE === "mock" ? "mock" : "live";

export const USE_MOCK_API = API_SOURCE === "mock";

/** The demo accounts the mock backend seeds. */
export const DEMO_ACCOUNT = { email: "demo@usestellance.com", password: "Password1" } as const;

/** Restores the seed data (mock mode only). */
export async function resetDemoData() {
	const { resetMockDb } = await import("@repo/mock-api/db");
	resetMockDb();
}
