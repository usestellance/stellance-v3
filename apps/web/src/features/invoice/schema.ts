import { z } from "zod";

// Logo validation
const logoSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "Logo must be less than 5MB",
  })
  .refine(
    (file) =>
      [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ].includes(file.type),
    {
      message: "Logo must be .jpg, .png or .webp format",
    }
  )
  .optional()
  .or(z.literal(undefined));

// Invoice schema - expandable
export const invoiceSchema = z.object({
  // Logo
  logo: logoSchema,

  // Invoice details (add more fields as needed)
  // invoiceNumber: z.string().min(1, { message: "Invoice number is required" }),
  //   invoiceDate: z.date({
  //     required_error: "Invoice date is required",
  //   }),
  //   dueDate: z.date({
  //     required_error: "Due date is required",
  //   }),

  // Client/Customer details
  title: z.string().min(2, { message: "Title is required" }),
  clientName: z.string().min(2, { message: "Client name is required" }),
  email: z.string().email({ message: "Invalid email address" }).optional(),
  address: z.string().optional(),

  // // Invoice items (expandable)
  items: z
    .array(
      z.object({
        invoice_type: z.enum(["per_hour", "per_unit"]),
        description: z.string(),
        quantity: z.number(),
        unit_price: z.number(),
        discount: z.number(),
        amount: z.number(),
      }),
    ),
    // .min(1, "At least one item is required"),

  // // Totals
  subtotal: z.number(),
  charge: z.number().optional(),
  total: z.number(),

  // // Additional fields
  notes: z.string().optional(),
  dueDate: z.string().refine(
    (value) => {
      const due = new Date(value);
      const today = new Date();

      // normalize time to avoid same-day issues
      today.setHours(0, 0, 0, 0);
      due.setHours(0, 0, 0, 0);

      return due >= today;
    },
    {
      message: "Due date cannot be in the past",
    },
  ),
  // dueDate: z.string(),

  // Add more fields here as you expand...
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

// export const itemSchema = z.object({
//   description: z
//     .string()
//     .min(1, "Description is required")
//     .min(3, "Description must be at least 3 characters")
//     .max(500, "Description must not exceed 500 characters"),
//   quantity: z
//     // .number()
//     // .min(1, "Quantity must be at least 1")
//     // .positive("Quantity must be a positive number"),
//   // unit_price: z
//   //   .number()
//   //   .min(0, "Unit price cannot be negative")
//   //   .positive("Unit price must be greater than 0"),
//   // discount: z
//   //   .number({
//   //     message: "Discount is required",
//   //   })
//   //   .min(0, "Discount cannot be negative")
//   //   .max(100, "Discount cannot exceed 100%"),
//   // amount: z
//   //   .number()
//   //   .min(0, "Amount cannot be negative"),
//   // invoice_type: z.enum(
//   //   ["per_hour", "per_unit"],
//   //   "Please select a valid invoice type"
//   // ),
// });

// export type ItemValues = z.infer<typeof itemSchema>;

export const itemSchema = z.object({
  invoice_type: z.enum(["per_hour", "per_unit"], "Invalid invoice type"),

  description: z.string().min(3, "Description must be at least 3 characters"),

  // quantity: z.number().min(1, "Quantity must be at least 1"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),

  unit_price: z.coerce.number().min(1, "Unit price must be greater 0"),
  discount: z.coerce
    .number()
    .min(0, "Discount must be 0 or greater")
    .max(100, "Discount cannot be more than 100%"),
  amount: z.coerce.number().min(0, "Amount must be 0 or greater"),
});

// export type ItemValues = z.infer<typeof itemSchema>;
