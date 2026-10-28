"use client";

import type { StellarWalletsKit as Kit } from "@creit.tech/stellar-wallets-kit/sdk";
import type { ModuleInterface } from "@creit.tech/stellar-wallets-kit/types";
import { NETWORK_PASSPHRASE } from "@/lib/stellar/config";
import { isPhone } from "@/features/payer-wallet/device";
import { usePayerWallet } from "@/features/payer-wallet/store";

/**
 * The client's own Stellar wallet on the payment page, through Stellar Wallets Kit (as in ../../go-medi):
 * Freighter's browser extension (its phone app over WalletConnect on phones), Albedo's web wallet, xBull,
 * and LOBSTR over WalletConnect. Loaded on first use. Stellance never sees the payer's keys: the wallet
 * signs, and the API detects and verifies the payment like any other.
 */

/** The wallets the payment page offers, in order. */
export const PAYER_WALLETS = [
	{ id: "freighter", name: "Freighter", kind: "Browser extension" },
	{ id: "lobstr", name: "LOBSTR", kind: "Mobile wallet" },
	{ id: "xbull", name: "xBull", kind: "Browser extension or app" },
	{ id: "albedo", name: "Albedo", kind: "Web wallet, no install" },
] as const;

export type PayerWalletId = (typeof PAYER_WALLETS)[number]["id"];

/** What the wallet row says: on a phone, Freighter is its app (over WalletConnect), not the extension. */
export function walletKind(id: PayerWalletId, phone: boolean) {
	if (id === "freighter" && phone) return "Freighter app";
	return PAYER_WALLETS.find((w) => w.id === id)?.kind ?? "";
}

export function walletName(id: string | null) {
	return PAYER_WALLETS.find((w) => w.id === id)?.name ?? "your wallet";
}

/**
 * WalletConnect (Reown) project id: lets phone wallets pair with the page (a deep link on a phone, a QR code
 * on a laptop). Not a secret: it ships in the bundle, and the project's domain allowlist protects it, so
 * every Stellance domain must be listed there. NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID overrides it.
 */
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "b8cc56756132b11f2077932ac3d6f807";
const WALLETCONNECT_ID = "wallet_connect";

/** How long a browser-extension wallet gets to answer "are you there?". */
const EXTENSION_CHECK_MS = 3000;

/** WalletConnect explorer ids of the Stellar wallets that pair over WalletConnect. */
const STELLAR_WALLETCONNECT_IDS = [
	"76a3d548a08cf402f5c7d021f24fd2881d767084b387a5325df88bc3d4b6f21b", // LOBSTR
	"997a355c8f682468706a76cff1b004a7115f505fb962dac54b6e9b442dd1c380", // Freighter
];

/** Freighter on a phone is the Freighter app, paired over WalletConnect; LOBSTR always pairs that way. */
function moduleFor(walletId: string) {
	if (walletId === "freighter" && isPhone()) return WALLETCONNECT_ID;
	if (walletId === "lobstr") return WALLETCONNECT_ID;
	return walletId;
}

let kitPromise: Promise<typeof Kit> | null = null;

/** Loaded on first use: it's large and touches the DOM, so it never runs on the server. */
function loadKit(): Promise<typeof Kit> {
	kitPromise ??= (async () => {
		const [{ StellarWalletsKit }, { defaultModules }, { Networks }, { WalletConnectModule, WalletConnectTargetChain }] = await Promise.all([
			import("@creit.tech/stellar-wallets-kit/sdk"),
			import("@creit.tech/stellar-wallets-kit/modules/utils"),
			import("@creit.tech/stellar-wallets-kit/types"),
			import("@creit.tech/stellar-wallets-kit/modules/wallet-connect"),
		]);
		const origin = window.location.origin;
		const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
		const modules: ModuleInterface[] = [
			...defaultModules(),
			new WalletConnectModule({
				projectId: WALLETCONNECT_PROJECT_ID,
				metadata: {
					name: "Stellance",
					description: "Pay your invoice in USDC on Stellar",
					url: origin,
					icons: [`${origin}${base}/apple-icon.png`],
				},
				allowedChains: [WalletConnectTargetChain.TESTNET],
				// Only Stellar wallets, in Stellance's colours.
				appKitOptions: {
					includeWalletIds: STELLAR_WALLETCONNECT_IDS,
					featuredWalletIds: STELLAR_WALLETCONNECT_IDS,
					themeMode: "light",
					themeVariables: {
						"--w3m-accent": "#000C3B",
						"--w3m-font-family": "Satoshi, system-ui, sans-serif",
						"--w3m-border-radius-master": "4px",
					},
				} as never,
			}),
		];
		// Preselect the stored wallet: after a reload, signing needs a module before any connect.
		const stored = usePayerWallet.getState().walletId;
		StellarWalletsKit.init({ modules, network: Networks.TESTNET, selectedWalletId: stored ? moduleFor(stored) : undefined });
		return StellarWalletsKit;
	})();
	return kitPromise;
}

/** Starts loading the kit (and WalletConnect's relay connection) ahead of the first tap. */
export function preloadWallets() {
	void loadKit().catch(() => undefined);
}

/** WalletConnect's client reaches its relay a moment after the kit loads; wait for it (up to 15 s) before asking. */
async function walletConnectReady(kit: typeof Kit) {
	const deadline = Date.now() + 15_000;
	while (!(await kit.selectedModule.isAvailable().catch(() => false))) {
		if (Date.now() > deadline) throw new Error("Phone wallets couldn’t be reached (WalletConnect didn’t start). Check your connection and try again.");
		await new Promise((resolve) => setTimeout(resolve, 250));
	}
}

/** AppKit's modal (WalletConnect): to notice when the person closes it. */
type AppKitLike = { subscribeState?: (callback: (state: { open: boolean }) => void) => () => void };

/** The kit waits forever if the WalletConnect modal is closed; a close with no approval right after rejects as a dismissal. */
async function fetchViaWalletConnect(kit: typeof Kit) {
	const modal = (kit.selectedModule as unknown as { modal?: AppKitLike }).modal;
	let unsubscribe = () => {};
	const closed = new Promise<never>((_, reject) => {
		let wasOpen = false;
		unsubscribe =
			modal?.subscribeState?.((state) => {
				if (state.open) wasOpen = true;
				else if (wasOpen) setTimeout(() => reject({ code: -1, message: "The wallet modal was closed." }), 1500);
			}) ?? (() => {});
	});
	try {
		return await Promise.race([kit.fetchAddress(), closed]);
	} finally {
		unsubscribe();
	}
}

/** Connects one wallet and remembers it; resolves with the payer's public address. */
export async function connectPayerWallet(walletId: PayerWalletId) {
	const kit = await loadKit();
	const moduleId = moduleFor(walletId);
	kit.setWallet(moduleId);
	// Without the extension, Freighter's own check never answers: give it 3 s, then call it not installed.
	if (moduleId === "freighter" || moduleId === "xbull") {
		const installed = await Promise.race([
			kit.selectedModule.isAvailable().catch(() => false),
			new Promise<boolean>((resolve) => setTimeout(() => resolve(false), EXTENSION_CHECK_MS)),
		]);
		if (!installed) throw new Error(`${walletName(walletId)} isn’t installed in this browser. Install it, or choose another wallet.`);
	}
	if (moduleId === WALLETCONNECT_ID) await walletConnectReady(kit);
	const { address } = moduleId === WALLETCONNECT_ID ? await fetchViaWalletConnect(kit) : await kit.fetchAddress();
	// Freighter's extension follows the person's own network setting; the others are pinned to Testnet by the kit.
	if (moduleId === "freighter") {
		const { networkPassphrase } = await kit.getNetwork();
		if (networkPassphrase !== NETWORK_PASSPHRASE) throw new Error("Switch Freighter to Testnet (Settings → Network), then try again.");
	}
	usePayerWallet.getState().setConnected(address, walletId);
	return address;
}

/** The kit's selected module id; reading `selectedModule` throws when none is set yet. */
function selectedModuleId(kit: typeof Kit) {
	try {
		return kit.selectedModule?.productId;
	} catch {
		return undefined;
	}
}

/** Has the payer's wallet sign a transaction (base64 XDR); resolves with the signed XDR. */
export async function signWithPayerWallet(walletId: PayerWalletId, xdr: string, address: string) {
	const kit = await loadKit();
	const moduleId = moduleFor(walletId);
	if (selectedModuleId(kit) !== moduleId) kit.setWallet(moduleId);
	if (moduleId === WALLETCONNECT_ID) await walletConnectReady(kit);
	const { signedTxXdr } = await kit.signTransaction(xdr, { address, networkPassphrase: NETWORK_PASSPHRASE });
	return signedTxXdr;
}

export async function disconnectPayerWallet() {
	usePayerWallet.getState().clear();
	if (!kitPromise) return;
	const kit = await kitPromise;
	await kit.disconnect().catch(() => undefined);
}

/** Wallets reject with `{ code, message }` objects, not Errors. */
export function walletErrorMessage(error: unknown, fallback = "The wallet didn’t complete the request.") {
	let message = "";
	if (error instanceof Error) message = error.message;
	else if (error && typeof error === "object" && "message" in error && typeof error.message === "string") message = error.message;
	// A bad WalletConnect project id surfaces as a relay socket error; an unlisted domain as an origin error.
	if (/project not found|unauthorized: invalid key/i.test(message)) {
		return "Phone wallets aren’t available right now (WalletConnect isn’t set up). Try Albedo, or pay with the QR code.";
	}
	if (/origin not allowed|not allowed origin|unauthorized origin/i.test(message)) {
		return "This site isn’t on the WalletConnect project’s allowed domains yet. Try Albedo, or pay with the QR code.";
	}
	return message || fallback;
}

/** Closing the picker or declining a prompt is a choice, not a failure. */
export function isWalletDismissal(error: unknown) {
	const message = walletErrorMessage(error, "");
	return !message || /declin|reject|cancel|denied|(modal|popup|window) (was )?closed|user closed|closed by (the )?user/i.test(message);
}
