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

const apiHost = "https://servicelayer3c.azure-api.net/wastecalendar/";

// postcode should have no spaces
const addressSearchBaseUri = `${apiHost}address/search?postCode=`;
const getAddressSearchUri = (postCode: string) => addressSearchBaseUri + postCode;

const houseNumbersMatch = (a: string, b: string) => {
	return a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;
};

export interface AddressSearchResponse {
	id: string //UPRN
	houseNumber: string //can be "5" or "5 GIBBONS HOUSE"
	street: string
	town: string
	postCode: string // format CB43LL
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

			const fetchResult = await fetch(getAddressSearchUri(postCode));
			const json: AddressSearchResponse[] = await fetchResult.json();

			const searchResult = json.find(x => houseNumbersMatch(x.houseNumber, houseNumber));

			if(searchResult != null) {
				return new Response(JSON.stringify(searchResult));
			}

			const stringed = JSON.stringify(json);
			console.log(stringed);

			return new Response("No result found for that postcode and house number", {status: 404});
		}

		return new Response("Not found", {status: 404});
	},
};
