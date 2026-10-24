/**
 * Stellar network constants. This sprint runs on Testnet only (docs/PLAN.md); assets have no value.
 * The USDC issuer is the one the API's custodial wallets trust (Circle's Testnet USDC).
 */
export const STELLAR_NETWORK = "testnet";

export const USDC = {
	code: "USDC",
	issuer: process.env.NEXT_PUBLIC_USDC_ISSUER || "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
	label: "USDC (Testnet)",
} as const;

const EXPLORER = "https://stellar.expert/explorer/testnet";

export const explorer = {
	tx: (hash: string) => `${EXPLORER}/tx/${hash}`,
	account: (address: string) => `${EXPLORER}/account/${address}`,
};

/** "GBC4BO…ZFGIE" for tight spaces; full values stay copyable. */
export function shortKey(value: string, head = 6, tail = 5) {
	return value.length > head + tail + 1 ? `${value.slice(0, head)}…${value.slice(-tail)}` : value;
}
