import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@repo/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@repo/ui/input-otp";
import {
	TransferFundsFormValues,
	transferFundsSchema,
} from "@/features/wallet/schema";

interface Props {
	onSubmit: (values: TransferFundsFormValues) => void | Promise<void>;
	isLoading?: boolean;
}

const TransferFundsForm = ({ onSubmit, isLoading }: Props) => {
	const form = useForm<TransferFundsFormValues>({
		resolver: zodResolver(transferFundsSchema),
		defaultValues: {
			amount: "",
			destination_address: "",
			source_asset: "XLM",
			dest_asset: "XLM",
			pin: "",
		},
	});

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-6"
			>
				<div>
					<p className="mt-2 text-sm text-neutral-900">
						Send funds from your wallet to another wallet address. Enter the
						recipient wallet address, amount, asset, and your wallet PIN to
						complete the transfer.
					</p>
				</div>

				<FormField
					control={form.control}
					name="destination_address"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Recipient Wallet Address</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder="Enter recipient wallet address"
									autoComplete="off"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="amount"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Amount</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="number"
									inputMode="decimal"
									placeholder="Enter amount"
									min="0"
									step="any"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<FormField
						control={form.control}
						name="source_asset"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Source Asset</FormLabel>
								<Select value={field.value} onValueChange={field.onChange}>
									<FormControl>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select source asset" />
										</SelectTrigger>
									</FormControl>

									<SelectContent>
										<SelectItem value="XLM">XLM</SelectItem>
										<SelectItem value="USDC">USDC</SelectItem>
									</SelectContent>
								</Select>

								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="dest_asset"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Destination Asset</FormLabel>
								<Select value={field.value} onValueChange={field.onChange}>
									<FormControl>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select destination asset" />
										</SelectTrigger>
									</FormControl>

									<SelectContent>
										<SelectItem value="XLM">XLM</SelectItem>
										<SelectItem value="USDC">USDC</SelectItem>
									</SelectContent>
								</Select>

								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="pin"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Wallet PIN</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="password"
									inputMode="numeric"
									maxLength={8}
									placeholder="Enter wallet PIN"
									autoComplete="off"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="rounded-lg border border-warning-300 bg-warning-50 p-4">
					<p className="text-sm text-warning-700">
						Double-check the recipient wallet address before sending. Transfers
						may be irreversible once processed.
					</p>
				</div>

				<div className="flex justify-end">
					<Button type="submit" className="min-w-40" disabled={isLoading}>
						{isLoading ? "Processing..." : "Transfer Funds"}
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default TransferFundsForm;
