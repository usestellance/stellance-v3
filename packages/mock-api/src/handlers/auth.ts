import { read, update, type MockUser } from "../db";
import { DEMO_EMAIL } from "../seed";
import { HttpError, TOKEN_PREFIX, ok, route } from "../router";
import { DAY, hex, iso, uuid } from "../util";
import { primaryWallet, profileDto, walletDto } from "./present";

/** /auth/* and /profile/*: sign-in, sign-up, verification, reset, profile completion. */

function session(user: MockUser) {
	const db = read();
	update((d) => {
		d.activity.unshift({ id: uuid(), user_id: user.id, action: "login", created_at: iso(Date.now()) });
	});
	return {
		access_token: `${TOKEN_PREFIX}${user.id}.${hex(24)}`,
		expires_in: Math.floor((Date.now() + 7 * DAY) / 1000),
		email_verified: user.email_verified,
		profile_complete: user.profile_complete,
		user: { ...profileDto(user), wallet: walletDto(primaryWallet(db, user.id)) },
	};
}

const findByEmail = (email: unknown) => read().users.find((u) => u.email.toLowerCase() === String(email ?? "").trim().toLowerCase());

route("POST", "/auth/login", "public", ({ body }) => {
	const user = findByEmail(body.email);
	if (!user || user.password !== body.password) throw new HttpError(401, "invalid email or password");
	if (!user.is_active) throw new HttpError(403, "this account has been deactivated");
	if (!user.email_verified) throw new HttpError(403, "please verify your email address before signing in");
	return ok(session(user), "Login successful");
});

route("POST", "/auth/social", "public", ({ body }) => {
	const user = findByEmail(body.email) ?? findByEmail(DEMO_EMAIL)!;
	return ok(session(user), "Login successful");
});

route("POST", "/auth/signup", "public", ({ body }) => {
	const email = String(body.email ?? "").trim().toLowerCase();
	if (!email || !String(body.password ?? "")) throw new HttpError(400, "email and password are required");
	if (findByEmail(email)) throw new HttpError(409, "an account with this email already exists");
	const now = iso(Date.now());
	const user: MockUser = {
		id: uuid(),
		email,
		password: String(body.password),
		first_name: "",
		last_name: "",
		business_name: "",
		phone_number: "",
		country: "",
		role: "user",
		email_verified: false,
		is_active: true,
		profile_complete: false,
		pin: null,
		created_at: now,
		updated_at: now,
	};
	update((db) => {
		db.users.push(user);
	});
	return ok({ access_token: "", user: profileDto(user) }, "Account created. Check your email to verify your account.", 201);
});

route("GET", "/auth/resend-email", "public", () => ok(null, "Verification email sent"));

/** No inbox in the mock: any link verifies the most recent unverified account. */
route("GET", "/auth/validate", "public", () => {
	update((db) => {
		const pending = [...db.users].reverse().find((u) => !u.email_verified);
		if (pending) pending.email_verified = true;
	});
	return ok(null, "Email verified successfully");
});

route("GET", "/auth/reset", "public", ({ query }) => {
	if (!query.get("email")) throw new HttpError(400, "email is required");
	return ok(null, "If an account exists, a reset code has been sent");
});

route("POST", "/auth/reset-password", "public", ({ body }) => {
	const password = String(body.password ?? body.new_password ?? "");
	update((db) => {
		const user = db.users.find((u) => u.email.toLowerCase() === String(body.email ?? "").toLowerCase());
		if (user && password) user.password = password;
	});
	return ok(null, "Password reset successfully");
});

route("POST", "/auth/change-password", "user", ({ body, user }) => {
	if (user!.password !== body.old_password) throw new HttpError(400, "current password is incorrect");
	if (String(body.new_password ?? "").length < 8) throw new HttpError(400, "new password must be at least 8 characters");
	update((db) => {
		db.users.find((u) => u.id === user!.id)!.password = String(body.new_password);
	});
	return ok(null, "Password changed successfully");
});

route("POST", "/auth/token", "user", ({ user }) => ok(session(user!), "Token refreshed"));

route("GET", "/profile/me", "user", ({ user }) => {
	const db = read();
	return ok(
		{ profile: profileDto(user!), profile_complete: user!.profile_complete, wallet: walletDto(primaryWallet(db, user!.id)) },
		"Profile fetched successfully",
	);
});

function applyProfile(id: string, body: Record<string, unknown>, complete: boolean) {
	return update((db) => {
		const u = db.users.find((x) => x.id === id)!;
		u.first_name = String(body.first_name ?? u.first_name);
		u.last_name = String(body.last_name ?? u.last_name);
		u.phone_number = String(body.phone_number ?? u.phone_number);
		u.business_name = String(body.business_name ?? u.business_name);
		u.country = String(body.country ?? body.Country ?? u.country);
		if (complete) u.profile_complete = true;
		u.updated_at = iso(Date.now());
		return { profile: profileDto(u), profile_complete: u.profile_complete, wallet: walletDto(primaryWallet(db, u.id)) };
	});
}

route("POST", "/profile", "user", ({ body, user }) => ok(applyProfile(user!.id, body, true), "Profile completed successfully"));
route("PUT", "/profile", "user", ({ body, user }) => ok(applyProfile(user!.id, body, false), "Profile updated successfully"));
