import { ExternalLink } from "lucide-react";
import clsx from "clsx";
import { explorer } from "@/lib/stellar/config";

/** "View on Stellar Expert" for a transaction or an account (Testnet). Opens in a new tab. */
export function ExplorerLink({
	hash,
	account,
	children = "View on Stellar Expert",
	className,
}: {
	hash?: string;
	account?: string;
	children?: React.ReactNode;
	className?: string;
}) {
	const href = hash ? explorer.tx(hash) : account ? explorer.account(account) : null;
	if (!href) return null;
	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			className={clsx("inline-flex items-center gap-1.5 font-medium text-info-500 underline-offset-4 hover:underline", className)}
		>
			{children}
			<ExternalLink size={14} className="shrink-0" />
		</a>
	);
}
