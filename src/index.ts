/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
}

export interface AddressSearchResponse {
	id: string //UPRN
	houseNumber: string //can be "5" or "5 GIBBONS HOUSE"
	street: string
	town: string
	postCode: string // format CB43LL
}

export interface BinCollection {
	date: string,
	roundTypes: RoundType[],
	slippedCollection: boolean
}

export interface BinContainer {
	type: RoundType,
	isAssisted: boolean,
	capacity: number,
	binSackTotal: number,
	isBinStore: boolean
}

export type RoundType = "DOMESTIC" | "RECYCLE" | "ORGANIC";

export interface BinSchedule {
	collections: BinCollection[],
	roundTypes: RoundType[],
	isBinStore: boolean,
	events: unknown[],
	containers: BinContainer[]
}

const jsonResponseHeaders = {
	headers: {
		'content-type': 'application/json;charset=UTF-8',
	},
}

const houseNumbersMatch = (a: string, b: string) => {
	if (a == null || b == null) {
		return false;
	}
	return a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;
};

const apiHost = "https://servicelayer3c.azure-api.net/wastecalendar/";

// postcode should have no spaces
const getAddressSearchUri = (postCode: string) => `${apiHost}address/search?postCode=${postCode}`;

async function searchAddress(postCode: string, houseNumber: string): Promise<AddressSearchResponse | undefined> {
	const fetchResult = await fetch(getAddressSearchUri(postCode));
	const json: AddressSearchResponse[] = await fetchResult.json();

	const searchResult = json.find(x => houseNumbersMatch(x.houseNumber, houseNumber));

	return searchResult;
}

const getBinScheduleUri = (uprn: string, numberOfCollections: number) => {
	return `${apiHost}collection/search/${uprn}/?numberOfCollections=${numberOfCollections}`;
};

async function getBinSchedule(uprn: string, numberOfCollections: number = 12): Promise<BinSchedule> {
	const uri = getBinScheduleUri(uprn, numberOfCollections);
	const fetchResult = await fetch(uri);
	const binSchedule: BinSchedule = await fetchResult.json();

	return binSchedule;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {

		const url= new URL(request.url);

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
				return new Response(JSON.stringify(binSchedule), jsonResponseHeaders);
			}
			else {
				return new Response("uprn, or houseName and postCode, must be specified", {status: 400});
			}
		}

		return new Response("Not found", {status: 404});
	},
};
