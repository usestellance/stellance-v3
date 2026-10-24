import type { ApiErrorLike } from "@/lib/api/errors";
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

// import { useMediaQuery } from "@/hooks/useMediaQuery";
import CreatePinForm, { CreatePinFormValues } from "@/features/wallet/components/pin/CreatePinForm";
// import { useCreatePin } from "../hooks/useCreatePin";
import { useToast } from "@/lib/use-toast";
import { useMediaQuery } from "@/lib/use-media-query";
import { useCreatePin } from "@/features/wallet/hooks";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const CreatePinDialog = ({ open, onOpenChange }: Props) => {
	const isDesktop = useMediaQuery("(min-width:768px)");

	const toast = useToast();

	const mutation = useCreatePin();

	const handleSubmit = async (values: CreatePinFormValues) => {
		try {
			await mutation.mutateAsync({
				pin: values.pin,
			});

			toast.success("Wallet PIN created successfully.");

			onOpenChange(false);
		} catch (caught) {
			const error = caught as ApiErrorLike;
			console.log(error);
			toast.error(error?.response?.data?.message ?? "Unable to create PIN.");
		}
	};

	const Form = (
		<CreatePinForm onSubmit={handleSubmit} isLoading={mutation.isPending} />
	);

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Create Wallet PIN</DialogTitle>
					</DialogHeader>

					{Form}
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent>
				<div className="mx-auto w-full max-w-md px-4 pb-6">
					<DrawerHeader className="px-0">
						<DrawerTitle>Create Wallet PIN</DrawerTitle>
					</DrawerHeader>

					{Form}
				</div>
			</DrawerContent>
		</Drawer>
	);
};

export default CreatePinDialog;
