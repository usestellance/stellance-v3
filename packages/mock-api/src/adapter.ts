import { AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { HttpError, RawBody, dispatch } from "./router";
import { settlePayments } from "./handlers/payments";
import "./handlers/index";

/**
 * An axios adapter that answers from the in-browser mock backend instead of the network. The apps
 * install it on their axios instances when NEXT_PUBLIC_API_SOURCE is "mock", so every existing hook
 * works unchanged: same URLs, same response envelopes, same error shapes (`error.response.data.message`).
 */

const LATENCY: [number, number] = [180, 520];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseBody(data: unknown): Record<string, unknown> {
	if (!data) return {};
	if (typeof FormData !== "undefined" && data instanceof FormData) {
		const out: Record<string, unknown> = {};
		data.forEach((value, key) => {
			out[key] = value;
		});
		return out;
	}
	if (typeof data === "string") {
		try {
			return JSON.parse(data) as Record<string, unknown>;
		} catch {
			return {};
		}
	}
	return data as Record<string, unknown>;
}

function headerValue(config: InternalAxiosRequestConfig, name: string) {
	const headers = config.headers as AxiosHeaders | Record<string, unknown> | undefined;
	const value = headers instanceof AxiosHeaders ? headers.get(name) : headers?.[name];
	return typeof value === "string" ? value : undefined;
}

export async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
	const url = new URL(config.url ?? "/", "http://mock.local/");
	const query = url.searchParams;
	for (const [key, value] of Object.entries(config.params ?? {})) if (value != null) query.set(key, String(value));
	// The API's routes sit under /api/v1; strip whatever base the app uses.
	const path = url.pathname.replace(/^\/(app\/)?api\/v1/, "") || "/";
	const method = (config.method ?? "get").toUpperCase();

	await wait(LATENCY[0] + Math.random() * (LATENCY[1] - LATENCY[0]));
	settlePayments();

	const respond = (status: number, data: unknown): AxiosResponse => ({
		data,
		status,
		statusText: String(status),
		headers: new AxiosHeaders({ "content-type": data instanceof Blob ? data.type : "application/json" }),
		config,
		request: { mock: true },
	});

	try {
		const result = await dispatch(method, path, query, parseBody(config.data), headerValue(config, "Authorization"));
		if (result instanceof RawBody) return respond(200, result.body);
		const status = (result as { status_code?: number })?.status_code ?? 200;
		return respond(status, result);
	} catch (error) {
		const status = error instanceof HttpError ? error.status : 500;
		const message = error instanceof Error ? error.message : "Mock backend error";
		if (!(error instanceof HttpError)) console.error("[mock-api]", method, path, error);
		const response = respond(status, { status_code: status, message });
		throw new AxiosError(message, status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST, config, response.request, response);
	}
}
