import { AddressSearchResponse, BinCollection, BinQueryResponse, BinSchedule } from '../model/BinTypes';

export const baseApiUrl = "https://cambin.olane.workers.dev/";

export async function getBins(postcode: string, houseNumber: string): Promise<BinQueryResponse> {
    const fetchUrl = baseApiUrl + `bins?postCode=${encodeURIComponent(postcode)}&houseNumber=${encodeURIComponent(houseNumber)}`;

    const result = await fetch(fetchUrl, {
        method: "GET",
        headers: {
            Accept: 'application/json',
        }
    });

    if (result.ok) {
        const json = await result.json();
        return toBinResponse(json);
    }
    else {
        throw new Error(result.statusText);
    }
}

function toBinResponse(json: any): BinQueryResponse {
    return {
        schedule: toSchedule(json.schedule),
        address: toAddress(json.address)
    };
}

function toSchedule(json: any): BinSchedule {
    return {
        collections: json.collections.map(toBinCollection),
        roundTypes: json.roundTypes,
        isBinStore: json.isBinStore,
        events: json.events,
        containers: json.containers
    };
}

function toAddress(json: any): AddressSearchResponse {
    return json as AddressSearchResponse;
}

function toBinCollection(json: any): BinCollection {
    return {
        date: new Date(json.date),
        roundTypes: json.roundTypes,
        slippedCollection: json.slippedCollection
    }
}
