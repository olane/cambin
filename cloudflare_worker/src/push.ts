import { buildPushPayload } from "@block65/webcrypto-web-push";
import { BinSchedule, RoundType, getBinSchedule } from "./waste_collection_client";

export interface PushEnv {
	PUSH_SUBSCRIPTIONS: KVNamespace;
	VAPID_PUBLIC_KEY: string;
	VAPID_PRIVATE_KEY: string;
	VAPID_SUBJECT: string;
}

export interface StoredSubscription {
	subscription: {
		endpoint: string;
		expirationTime: number | null;
		keys: {
			auth: string;
			p256dh: string;
		};
	};
	uprn: string;
	houseNumber: string;
	postCode: string;
}

export interface ReminderMessage {
	title: string;
	body: string;
	url: string;
}

const roundTypeNames: Record<RoundType, string> = {
	DOMESTIC: "black",
	RECYCLE: "blue",
	ORGANIC: "green",
	FOOD: "food waste",
};

const londonDateFormatter = new Intl.DateTimeFormat("en-GB", {
	timeZone: "Europe/London",
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

const londonDateString = (date: Date): string => {
	const parts = londonDateFormatter.formatToParts(date);
	const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
	return `${part("year")}-${part("month")}-${part("day")}`;
};

const collectionDateString = (rawDate: string): string | undefined => {
	const isoDate = rawDate.slice(0, 10);
	if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
		return isoDate;
	}

	const parsed = new Date(rawDate);
	if (Number.isNaN(parsed.getTime())) {
		return undefined;
	}

	return londonDateString(parsed);
};

export function buildReminderMessage(schedule: BinSchedule, date: string): ReminderMessage | undefined {
	const roundTypes = schedule.collections
		.filter((collection) => collectionDateString(collection.date) === date)
		.flatMap((collection) => collection.roundTypes);

	if (roundTypes.length === 0) {
		return undefined;
	}

	const names = Array.from(new Set(roundTypes)).map((roundType) => roundTypeNames[roundType] ?? roundType);

	const body =
		names.length === 1
			? `Put out your ${names[0]} bin tonight.`
			: `Put out your ${joinWithCommasAnd(names)} bins tonight.`;

	return {
		title: "Bins tomorrow",
		body,
		url: "/",
	};
}

function joinWithCommasAnd(items: string[]): string {
	if (items.length <= 1) {
		return items.join("");
	}
	return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

const subscriptionKey = async (endpoint: string): Promise<string> => {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(endpoint));
	return Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
};

export async function saveSubscription(env: PushEnv, stored: StoredSubscription): Promise<void> {
	const key = await subscriptionKey(stored.subscription.endpoint);
	await env.PUSH_SUBSCRIPTIONS.put(key, JSON.stringify(stored));
}

export async function deleteSubscription(env: PushEnv, endpoint: string): Promise<void> {
	const key = await subscriptionKey(endpoint);
	await env.PUSH_SUBSCRIPTIONS.delete(key);
}

export async function listSubscriptions(env: PushEnv): Promise<StoredSubscription[]> {
	const subscriptions: StoredSubscription[] = [];
	let cursor: string | undefined;

	do {
		const page = await env.PUSH_SUBSCRIPTIONS.list({ cursor });
		for (const key of page.keys) {
			const value = await env.PUSH_SUBSCRIPTIONS.get<StoredSubscription>(key.name, "json");
			if (value != null) {
				subscriptions.push(value);
			}
		}
		cursor = page.list_complete ? undefined : page.cursor;
	} while (cursor != null);

	return subscriptions;
}

async function sendPush(env: PushEnv, stored: StoredSubscription, message: ReminderMessage): Promise<boolean> {
	const payload = await buildPushPayload(
		{
			data: { title: message.title, body: message.body, url: message.url },
			options: { ttl: 60 * 60 * 24 * 7 },
		},
		stored.subscription,
		{
			subject: env.VAPID_SUBJECT,
			publicKey: env.VAPID_PUBLIC_KEY,
			privateKey: env.VAPID_PRIVATE_KEY,
		}
	);

	const response = await fetch(stored.subscription.endpoint, {
		method: payload.method,
		headers: payload.headers,
		body: payload.body,
	});

	if (response.status === 404 || response.status === 410) {
		// The subscription is no longer valid, drop it.
		await deleteSubscription(env, stored.subscription.endpoint);
		return false;
	}

	return response.ok;
}

export interface ReminderRunResult {
	sent: number;
	failed: number;
}

export async function sendBinReminders(env: PushEnv, now: Date = new Date()): Promise<ReminderRunResult> {
	const subscriptions = await listSubscriptions(env);
	const tomorrow = londonDateString(new Date(now.getTime() + 24 * 60 * 60 * 1000));

	const schedules = new Map<string, BinSchedule>();
	const result: ReminderRunResult = { sent: 0, failed: 0 };

	for (const stored of subscriptions) {
		try {
			let schedule = schedules.get(stored.uprn);
			if (schedule === undefined) {
				schedule = await getBinSchedule(stored.uprn);
				schedules.set(stored.uprn, schedule);
			}

			const message = buildReminderMessage(schedule, tomorrow);
			if (message === undefined) {
				continue;
			}

			if (await sendPush(env, stored, message)) {
				result.sent++;
			} else {
				result.failed++;
			}
		} catch (error) {
			console.error(`Failed to send reminder for ${stored.subscription.endpoint}`, error);
			result.failed++;
		}
	}

	return result;
}
