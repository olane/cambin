import { searchAddress, getBinSchedule } from "./waste_collection_client";
import {
	PushEnv,
	StoredSubscription,
	deleteSubscription,
	saveSubscription,
	sendBinReminders,
} from "./push";

export interface Env extends PushEnv {
}

export type { AddressSearchResponse, BinSchedule, RoundType } from "./waste_collection_client";

const jsonResponseHeaders = {
	headers: {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
		'content-type': 'application/json;charset=UTF-8'
	},
}

const corsPreflightResponse = () => new Response(null, {
	status: 204,
	headers: {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
	}
});

const badRequest = (message: string) => new Response(message, { status: 400, headers: jsonResponseHeaders.headers });

async function readJsonBody<T>(request: Request): Promise<T | undefined> {
	try {
		return await request.json<T>();
	}
	catch {
		return undefined;
	}
}

const isStoredSubscription = (value: unknown): value is StoredSubscription => {
	const candidate = value as StoredSubscription | undefined;
	return candidate != null
		&& typeof candidate.uprn === "string"
		&& candidate.subscription != null
		&& typeof candidate.subscription.endpoint === "string"
		&& candidate.subscription.keys != null
		&& typeof candidate.subscription.keys.auth === "string"
		&& typeof candidate.subscription.keys.p256dh === "string";
};

async function handleSubscribe(request: Request, env: Env): Promise<Response> {
	const body = await readJsonBody<StoredSubscription>(request);

	if (!isStoredSubscription(body)) {
		return badRequest("A valid push subscription with a uprn must be specified");
	}

	await saveSubscription(env, body);
	return new Response(null, { status: 204, headers: jsonResponseHeaders.headers });
}

async function handleUnsubscribe(request: Request, env: Env): Promise<Response> {
	const body = await readJsonBody<{ endpoint?: string }>(request);

	if (body?.endpoint == null) {
		return badRequest("endpoint must be specified");
	}

	await deleteSubscription(env, body.endpoint);
	return new Response(null, { status: 204, headers: jsonResponseHeaders.headers });
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {

		const url= new URL(request.url);

		if(request.method === "OPTIONS") {
			return corsPreflightResponse();
		}

		if(url.pathname === "/push/config") {
			return new Response(JSON.stringify({ publicKey: env.VAPID_PUBLIC_KEY ?? null }), jsonResponseHeaders);
		}

		if(url.pathname === "/push/subscribe" && request.method === "POST") {
			return handleSubscribe(request, env);
		}

		if(url.pathname === "/push/unsubscribe" && request.method === "POST") {
			return handleUnsubscribe(request, env);
		}

		if(url.pathname === "/search") {
			const postCode = url.searchParams.get("postCode");
			const houseNumber = url.searchParams.get("houseNumber");

			if(postCode == null || houseNumber == null) {
				return new Response("postCode and houseNumber must be specified", {status: 400});
			}

			const searchResult = await searchAddress(postCode, houseNumber);
			if(searchResult != undefined) {
				return new Response(JSON.stringify(searchResult), jsonResponseHeaders);
			}

			return new Response("No result found for that postcode and house number", {status: 404});
		}

		if(url.pathname === "/bins") {
			const uprn = url.searchParams.get("uprn");
			const postCode = url.searchParams.get("postCode");
			const houseNumber = url.searchParams.get("houseNumber");

			if(uprn != null) {
				const binSchedule = await getBinSchedule(uprn);
				return new Response(JSON.stringify(binSchedule), jsonResponseHeaders);
			}
			else if(postCode != null && houseNumber != null) {
				const searchResult = await searchAddress(postCode, houseNumber);

				if(searchResult == undefined) {
					return new Response("No result found for that postcode and house number", {status: 404});
				}

				const uprn = searchResult.id;
				const binSchedule = await getBinSchedule(uprn);

				const response = {
					address: searchResult,
					schedule: binSchedule
				};

				return new Response(JSON.stringify(response), jsonResponseHeaders);
			}
			else {
				return new Response("uprn, or houseName and postCode, must be specified", {status: 400});
			}
		}

		return new Response("Not found", {status: 404});
	},

	async scheduled(
		event: ScheduledEvent,
		env: Env,
		ctx: ExecutionContext
	): Promise<void> {
		ctx.waitUntil(sendBinReminders(env).then((result) => {
			console.log(`Sent ${result.sent} bin reminders (${result.failed} failed)`);
		}));
	},
};
