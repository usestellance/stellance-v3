/** Formatting for the console: money in USDC, dates in the admin's locale, short keys. */
export const formatUsdc = (amount: number) =>
	`${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} USDC`;

export const formatNumber = (n: number) => new Intl.NumberFormat("en-US").format(n);

export function formatDate(value: string | null | undefined, withTime = false) {
	if (!value) return "—";
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
	}).format(new Date(value));
}

export const shortKey = (value: string, head = 6, tail = 5) =>
	value.length > head + tail + 1 ? `${value.slice(0, head)}…${value.slice(-tail)}` : value;

export const titleCase = (value: string) => value.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export const explorerTx = (hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`;

/** A payment's asset code: `asset_code`, or the older "USDC:G…" `asset`; "native" is XLM. */
export const assetCode = (p: { asset_code?: string; asset?: string }) => {
	const code = p.asset_code ?? p.asset?.split(":")[0] ?? "";
	return code === "native" ? "XLM" : code;
};

export const formatAmount = (amount: string | number) =>
	new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 7 }).format(Number(amount));
