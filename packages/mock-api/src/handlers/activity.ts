import { read, update, type MockComment } from "../db";
import { HttpError, ok, route } from "../router";
import { iso, uuid } from "../util";
import { num } from "./present";

/** /comments, /notification: the invoice conversation and the bell. */

function commentDto(comment: MockComment, viewerEmail: string | null) {
	const mine = !!viewerEmail && comment.commenter_email.toLowerCase() === viewerEmail.toLowerCase();
	return {
		id: comment.id,
		invoice_id: comment.invoice_id,
		user_id: { String: comment.user_id ?? "", Valid: !!comment.user_id },
		commenter_name: comment.commenter_name,
		commenter_email: comment.commenter_email,
		comment_text: comment.comment_text,
		is_verified: !comment.is_guest,
		is_guest: comment.is_guest,
		parent_comment_id: { String: comment.parent_comment_id ?? "", Valid: !!comment.parent_comment_id },
		edited: false,
		edited_at: { Time: "0001-01-01T00:00:00Z", Valid: false },
		created_at: comment.created_at,
		updated_at: comment.created_at,
		can_edit: mine,
		can_delete: mine,
	};
}

route("GET", "/comments", "public", ({ query }) => {
	const invoiceId = query.get("invoice_id");
	if (!invoiceId) throw new HttpError(400, "invoice_id is required");
	const all = read()
		.comments.filter((c) => c.invoice_id === invoiceId)
		.sort((a, b) => (query.get("sort_order") === "desc" ? -1 : 1) * a.created_at.localeCompare(b.created_at));
	const limit = num(query.get("limit"), 20);
	const total_pages = Math.max(1, Math.ceil(all.length / limit));
	const page = Math.min(num(query.get("page"), 1), total_pages);
	const latest = all.reduce((m, c) => (c.created_at > m ? c.created_at : m), "");
	return ok({
		comments: all.slice((page - 1) * limit, page * limit).map((c) => commentDto(c, null)),
		stats: {
			invoice_id: invoiceId,
			total_comments: all.length,
			verified_comments: all.filter((c) => !c.is_guest).length,
			guest_comments: all.filter((c) => c.is_guest).length,
			top_level_comments: all.filter((c) => !c.parent_comment_id).length,
			reply_comments: all.filter((c) => c.parent_comment_id).length,
			latest_comment_at: latest,
		},
		total: all.length,
		page,
		limit,
		total_pages,
	});
});

/** Signed-in merchants and guests (the payer, via the emailed token) can both comment. */
route("POST", "/comments", "public", ({ body }) => {
	const text = String(body.comment_text ?? "").trim();
	if (!text) throw new HttpError(400, "comment_text is required");
	return ok(
		update((db) => {
			const invoice = db.invoices.find((i) => i.id === body.invoice_id);
			if (!invoice) throw new HttpError(404, "invoice not found");
			const author = body.user_id ? db.users.find((u) => u.id === body.user_id) : undefined;
			const comment: MockComment = {
				id: uuid(),
				invoice_id: invoice.id,
				user_id: author?.id ?? null,
				commenter_name: String(body.commenter_name || author?.first_name || invoice.payer_name),
				commenter_email: String(body.commenter_email || author?.email || invoice.payer_email),
				comment_text: text,
				parent_comment_id: body.parent_id ? String(body.parent_id) : null,
				is_guest: !author,
				created_at: iso(Date.now()),
			};
			db.comments.push(comment);
			if (!author) {
				db.notifications.unshift({
					id: uuid(),
					user_id: invoice.user_id,
					title: "New comment",
					body: `${comment.commenter_name} commented on ${invoice.invoice_number}.`,
					viewed: false,
					created_at: comment.created_at,
				});
			}
			return commentDto(comment, comment.commenter_email);
		}),
		"Comment posted",
		201,
	);
});

route("GET", "/notification", "user", ({ query, user }) => {
	const mine = read()
		.notifications.filter((n) => n.user_id === user!.id)
		.sort((a, b) => (query.get("order_by") === "ASC" ? 1 : -1) * a.created_at.localeCompare(b.created_at));
	const count = num(query.get("limit") ?? query.get("count"), 10);
	const total_pages = Math.max(1, Math.ceil(mine.length / count));
	const page = Math.min(num(query.get("page"), 1), total_pages);
	return ok({
		items: mine.slice((page - 1) * count, page * count),
		notifications: mine.slice((page - 1) * count, page * count),
		meta: {
			page,
			limit: count,
			total: mine.length,
			page_count: mine.length,
			unread_count: mine.filter((n) => !n.viewed).length,
			read_count: mine.filter((n) => n.viewed).length,
			total_pages,
		},
	});
});

route("GET", "/notification/:id", "user", ({ params, user }) => {
	const n = read().notifications.find((x) => x.id === params.id && x.user_id === user!.id);
	if (!n) throw new HttpError(404, "notification not found");
	return ok(n);
});

route("PATCH", "/notification/:id", "user", ({ params, query, user }) =>
	ok(
		update((db) => {
			const n = db.notifications.find((x) => x.id === params.id && x.user_id === user!.id);
			if (!n) throw new HttpError(404, "notification not found");
			n.viewed = query.get("viewed") === null ? !n.viewed : query.get("viewed") === "true";
			return n;
		}),
		"Notification updated",
	),
);

route("DELETE", "/notification/:id", "user", ({ params, user }) => {
	update((db) => {
		db.notifications = db.notifications.filter((x) => !(x.id === params.id && x.user_id === user!.id));
	});
	return ok(null, "Notification deleted");
});

