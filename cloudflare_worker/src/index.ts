import { searchAddress, getBinSchedule } from "./waste_collection_client";

export interface Env {
}

const jsonResponseHeaders = {
	headers: {
		'Access-Control-Allow-Origin': '*',
		'content-type': 'application/json;charset=UTF-8'
	},
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
};
