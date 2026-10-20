import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@repo/ui/drawer";
import { useMediaQuery } from "@/lib/use-media-query";
import { useToast } from "@/lib/use-toast";
import { useTransferFunds } from "@/features/wallet/hooks";
import { TransferFundsFormValues } from "@/features/wallet/schema";
import TransferFundsForm from "@/features/wallet/components/transfer/TransferFundsForm";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const TransferFundsDialog = ({ open, onOpenChange }: Props) => {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const toast = useToast();
	const transferFunds = useTransferFunds();

	const handleSubmit = async (values: TransferFundsFormValues) => {
		try {
			await transferFunds.mutateAsync(values);
			toast.success("Transfer completed successfully.");
			onOpenChange(false);
		} catch (error: any) {
			toast.error(
				error?.response?.data?.message ??
					error?.message ??
					"Failed to transfer funds.",
			);
		}
	};

	const form = (
		<TransferFundsForm
			onSubmit={handleSubmit}
			isLoading={transferFunds.isPending}
		/>
	);

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto hide-scroll">
					<DialogHeader>
						<DialogTitle>Transfer Funds</DialogTitle>
					</DialogHeader>

					{form}
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="h-[85vh] max-h-[85vh] flex flex-col p-0">
				<div className="mx-auto flex h-full w-full max-w-lg flex-col min-h-0">
					<DrawerHeader className="px-4 pt-4 pb-2 shrink-0">
						<DrawerTitle>Transfer Funds</DrawerTitle>
					</DrawerHeader>

					<div className="flex-1 min-h-0 overflow-y-auto overscroll-contain hide-scroll px-4 pb-8">
						{form}
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
};

export default TransferFundsDialog;
