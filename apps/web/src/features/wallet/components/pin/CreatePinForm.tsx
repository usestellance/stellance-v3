import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

const createPinSchema = z
	.object({
		pin: z
			.string()
			.min(4, "PIN must be at least 4 digits")
			.max(8, "PIN cannot exceed 8 digits")
			.regex(/^\d+$/, "PIN must contain only numbers"),

		confirm_pin: z.string(),
	})
	.refine((data) => data.pin === data.confirm_pin, {
		message: "PINs do not match",
		path: ["confirm_pin"],
	});

export type CreatePinFormValues = z.infer<typeof createPinSchema>;

interface Props {
	onSubmit: (values: CreatePinFormValues) => void;
	isLoading?: boolean;
}

const CreatePinForm = ({ onSubmit, isLoading }: Props) => {
	const [showPin, setShowPin] = useState(false);
	const [showConfirmPin, setShowConfirmPin] = useState(false);

	const form = useForm<CreatePinFormValues>({
		resolver: zodResolver(createPinSchema),
		defaultValues: {
			pin: "",
			confirm_pin: "",
		},
	});

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div>
					{/* <h3 className="text-xl font-semibold">Create Wallet PIN</h3> */}

					<p className="mt-2 text-sm text-neutral-900">
						Create a secure transaction PIN. You&apos;ll be asked for this PIN
						whenever you transfer funds or perform sensitive wallet actions.
					</p>
				</div>

				<FormField
					control={form.control}
					name="pin"
					render={({ field }) => (
						<FormItem>
							<FormLabel>PIN</FormLabel>

							<FormControl>
								<div className="relative">
									<Input
										{...field}
										type={showPin ? "text" : "password"}
										inputMode="numeric"
										maxLength={8}
										placeholder="Enter PIN"
										autoComplete="new-password"
									/>

									<button
										type="button"
										onClick={() => setShowPin(!showPin)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-900"
									>
										{showPin ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="confirm_pin"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Confirm PIN</FormLabel>

							<FormControl>
								<div className="relative">
									<Input
										{...field}
										type={showConfirmPin ? "text" : "password"}
										inputMode="numeric"
										maxLength={8}
										placeholder="Confirm PIN"
										autoComplete="new-password"
									/>

									<button
										type="button"
										onClick={() => setShowConfirmPin(!showConfirmPin)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-900"
									>
										{showConfirmPin ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="rounded-lg border border-warning-300 bg-warning-50 p-4">
					<p className="text-sm text-warning-700">
						Keep your wallet PIN private. Never share it with anyone. You&apos;ll
						need it to authorize wallet transfers and other sensitive actions.
					</p>
				</div>

				<div className="flex justify-end">
					<Button type="submit" className="min-w-40" disabled={isLoading}>
						{isLoading ? "Creating..." : "Create PIN"}
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default CreatePinForm;
