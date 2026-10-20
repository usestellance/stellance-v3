import {
	LucideArrowRightLeft,
	LucideKeyRound,
	LucideShield,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
	onTransferFunds: () => void;
	onCreatePin: () => void;
	onExportKeys: () => void;
}

const WalletActions = ({
	onTransferFunds,
	onCreatePin,
	onExportKeys,
}: Props) => {
	const router = useRouter();

	const actions = [
		{
			title: "Transfer Funds",
			description: "Send crypto to another wallet",
			icon: LucideArrowRightLeft,
			onClick: onTransferFunds,
		},
		{
			title: "Export Keys",
			description: "Download your secret keys",
			icon: LucideKeyRound,
			onClick: onExportKeys,
		},
		{
			title: "Wallet PIN",
			description: "Create or change your PIN",
			icon: LucideShield,
			onClick: onCreatePin,
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-3">
			{actions.map((action) => {
				const Icon = action.icon;

				return (
					<button
						key={action.title}
						onClick={action.onClick}
						className="bg-primary-20 border border-primary-50 rounded-xl p-5 text-left transition-all hover:border-primary-300 hover:bg-primary-50"
					>
						<div className="bg-primary-500 w-12 h-12 rounded-full flex items-center justify-center text-white">
							<Icon size={22} />
						</div>

						<h4 className="mt-4 font-semibold text-lg">{action.title}</h4>

						<p className="text-sm text-neutral-900 mt-1">
							{action.description}
						</p>
					</button>
				);
			})}
		</div>
	);
};

export default WalletActions;
