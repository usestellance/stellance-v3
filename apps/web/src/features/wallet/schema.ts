import { z } from "zod";

export const createPinSchema = z
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

export type CreatePinFormData = z.infer<typeof createPinSchema>;

export const transferFundsSchema = z.object({
	amount: z
		.string()
		.min(1, "Amount is required")
		.refine((val) => !Number.isNaN(Number(val)), {
			message: "Amount must be a valid number",
		})
		.refine((val) => Number(val) > 0, {
			message: "Amount must be greater than 0",
		}),

	destination_address: z.string().min(1, "Destination address is required"),

	source_asset: z.enum(["XLM", "USDC"], "Select a source asset"),

	dest_asset: z.enum(["XLM", "USDC"], "Select a destination asset"),

	pin: z
		.string()
		.min(4, "PIN must be at least 4 digits")
		.max(8, "PIN cannot exceed 8 digits")
		.regex(/^\d+$/, "PIN must contain only numbers"),
});

export type TransferFundsFormValues = z.infer<typeof transferFundsSchema>;
