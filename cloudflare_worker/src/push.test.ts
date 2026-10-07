import { describe, expect, it } from "vitest";
import { buildReminderMessage } from "./push";
import { BinCollection, BinSchedule } from "./waste_collection_client";

const scheduleWith = (collections: BinCollection[]): BinSchedule => ({
	collections,
	roundTypes: [],
	isBinStore: false,
	events: [],
	containers: [],
});

const collection = (date: string, roundTypes: BinCollection["roundTypes"]): BinCollection => ({
	date,
	roundTypes,
	slippedCollection: false,
});

describe("buildReminderMessage", () => {
	it("returns undefined when there is no collection", () => {
		const message = buildReminderMessage(scheduleWith([]), "2024-05-20");
		expect(message).toBeUndefined();
	});

	it("returns undefined when the collection is on another day", () => {
		const schedule = scheduleWith([collection("2024-05-21T00:00:00", ["DOMESTIC"])]);
		expect(buildReminderMessage(schedule, "2024-05-20")).toBeUndefined();
	});

	it("names a single round type", () => {
		const schedule = scheduleWith([collection("2024-05-20T00:00:00", ["RECYCLE"])]);
		const message = buildReminderMessage(schedule, "2024-05-20");
		expect(message?.body).toEqual("Put out your blue bin tonight.");
	});

	it("combines multiple round types on the same day", () => {
		const schedule = scheduleWith([
			collection("2024-05-20T00:00:00", ["DOMESTIC"]),
			collection("2024-05-20T00:00:00", ["RECYCLE", "FOOD"]),
		]);
		const message = buildReminderMessage(schedule, "2024-05-20");
		expect(message?.body).toEqual("Put out your black, blue and food waste bins tonight.");
	});

	it("does not duplicate round types", () => {
		const schedule = scheduleWith([
			collection("2024-05-20T00:00:00", ["DOMESTIC"]),
			collection("2024-05-20T00:00:00", ["DOMESTIC"]),
		]);
		const message = buildReminderMessage(schedule, "2024-05-20");
		expect(message?.body).toEqual("Put out your black bin tonight.");
	});
});
