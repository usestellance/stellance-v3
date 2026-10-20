export const authRoutes = {
	LOGIN: "/auth/sign-in",
	SIGN_UP: "/auth/sign-up",
	VERIFICATION_SENT: (email: string) =>
		`/auth/sign-up/verification-sent?email=${email}`,
	FORGOT_PASSWORD: "/auth/forgot-password",
	RESET_PASSWORD: (email: string) => `/auth/reset-password?email=${email}`,
	CREATE_FIRST_INVOICE: "/auth/create-first-invoice",
	COMPLETE_PROFILE: "/auth/setup-account",
};

export const overviewRoutes = {
	OVERVIEW: "/overview",
};
export const invoiceRoutes = {
	INVOICES: "/invoices",
	CREATE: "/invoices/create",
	CHOOSE_TEMPLATE: "/invoices/create/choose-template",
	PREVIEW_INVOICE: ({
		invoice_id,
		tab = "invoice",
	}: {
		invoice_id: string;
		tab?: "invoice" | "comment";
	}) => `/invoices/${invoice_id}/preview?tab=${tab}`,
	EDIT_INVOICE: (invoice_id: string) => `/invoices/${invoice_id}/edit`,
	PAYMENT_DETAILS: (invoice_id: string) => `/invoices/${invoice_id}/payment`,
};
export const profileRoutes = {
	PROFILE: "/profile",
};
export const walletRoutes = {
	WALLET: "/wallet",
};
export const transactionsRoutes = {
	TRANSACTIONS: "/transactions",
	TRANSACTION: (id: string) => `/transactions/${id}`,
	/** Incoming invoice payments and their verification results. */
	PAYMENTS: "/transactions/payments",
	PAYMENT: (id: string) => `/transactions/payments/${id}`,
};

export const receiptRoutes = {
	ACCOUNT_STATEMENT: "/account-statement",
	PREVIEW_RECEIPT: (receipt_id: string) => `/receipts/${receipt_id}`,
};
export const notificationRoutes = {
	NOTIFICATIONS: "/notifications",
};

export const clientRoutes = {
	PREVIEW_INVOICE: ({
		invoice_id,
		tab = "invoice",
	}: {
		invoice_id: string;
		tab: "invoice" | "comment";
	}) => `/client/${invoice_id}?tab=${tab}`,
	MAKE_PAYMENT: (id: string) => `/client/${id}/make-payment`,
};

export const backendRoutes = {
	AUTH_ROUTES: {
		SIGN_UP: "/auth/signup",
		SIGN_IN: "/auth/login",
		RESEND_VERIFICATION_LINK: (email: string) =>
			`/auth/resend-email?email=${email}`,
		VALIDATE_TOKEN: (token: string) => `/auth/validate?token=${token}`,
		RESET_PASSWORD_EMAIL: (email: string) => `/auth/reset?email=${email}`,
		RESET_PASSWORD: `/auth/reset-password`,
	},
	PROFILE_ROUTES: {
		UPDATE_PROFILE: "/profile",
		GET_USER: "/profile/me",
	},
};
