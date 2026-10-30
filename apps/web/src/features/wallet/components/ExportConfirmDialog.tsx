import type { ApiErrorLike } from "@/lib/api/errors";
import { useToast } from "@/lib/use-toast";
import { useExportWalletKeys } from "@/features/wallet/hooks";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@repo/ui/alert-dialog";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const ExportKeysDialog = ({ open, onOpenChange }: Props) => {
	const toast = useToast();

	const exportKeys = useExportWalletKeys();

	const handleExport = async () => {
		try {
			await exportKeys.mutateAsync();

			toast.success("Wallet keys exported successfully.");
		} catch (caught) {
			const error = caught as ApiErrorLike & { message?: string };
			toast.error(error?.response?.data?.message ?? error?.message ?? "Failed to export wallet keys.");
		} finally {
			onOpenChange(false);
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Export Wallet Keys</AlertDialogTitle>

					<div className="space-y-3">
						<p>This will download a PDF containing your wallet keys.</p>

						<div className="rounded-lg border border-warning-300 bg-warning-50 p-4">
							<ul className="space-y-2 text-sm text-warning-700 list-disc pl-5">
								<li>Keep this file secure.</li>
								<li>Never share it with anyone.</li>
								<li>Anyone with these keys can access your wallet.</li>
							</ul>
						</div>
					</div>
				</AlertDialogHeader>

				<AlertDialogFooter className="flex  w-full mx-auto">
					<AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>

					<AlertDialogAction
						className="flex-1"
						onClick={handleExport}
						disabled={exportKeys.isPending}
					>
						{exportKeys.isPending ? "Exporting..." : "Export Keys"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default ExportKeysDialog;
