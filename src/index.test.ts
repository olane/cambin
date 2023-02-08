import { unstable_dev } from "wrangler";
import type { UnstableDevWorker } from "wrangler";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { AddressSearchResponse, BinSchedule } from ".";

describe("Worker", () => {
	let worker: UnstableDevWorker;

	beforeAll(async () => {
		worker = await unstable_dev("src/index.ts", {
			experimental: { disableExperimentalWarning: true },
		});
	});

	afterAll(async () => {
		await worker.stop();
	});

	it("should 404 for a random route", async () => {
		const resp = await worker.fetch('/dfsdf');
		if (resp) {
			expect(resp.status).toBe(404);
		}
	});

	describe("/search", () => {
		it("should 400 if wrong arguments", async () => {
			const resp = await worker.fetch('/search?blah=foo');
			if (resp) {
				expect(resp.status).toBe(400);
			}
		});

		it("should return something if correct arguments", async () => {
			const resp = await worker.fetch("/search?postCode=CB43LL&houseNumber=5+Gibbons+House");
			expect(resp.status).toBe(200);
			if (resp) {
				const json: AddressSearchResponse = await resp.json();
				expect(json.id).toEqual('200004164294');
			}
		});

		it("should return 404 if no address match", async () => {
			const resp = await worker.fetch("/search?postCode=CB74RT&houseNumber=55");
			expect(resp.status).toBe(404);
		});
	});

	describe("/bins", () => {
		it("should 400 if wrong arguments", async () => {
			const resp = await worker.fetch('/bins?blah=foo');
			if (resp) {
				expect(resp.status).toBe(400);
			}
		});

		it("should return something if UPRN passed", async () => {
			const resp = await worker.fetch("/bins?uprn=200004164294");
			if (resp) {
				const json: BinSchedule = await resp.json();
				expect(json.isBinStore).toEqual(true);
			}
		});

		it("should return something if houseNumber and postCode passed", async () => {
			const resp = await worker.fetch("/bins?postCode=CB43LL&houseNumber=5+Gibbons+House");
			if (resp) {
				const json: BinSchedule = await resp.json();
				expect(json.isBinStore).toEqual(true);
			}
		});

		it("should return 404 if no address match", async () => {
			const resp = await worker.fetch("/bins?postCode=CB74JA&houseNumber=55");
			expect(resp.status).toBe(404);
		});
	});
});
