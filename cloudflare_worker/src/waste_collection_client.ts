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

export type RoundType = "DOMESTIC" | "RECYCLE" | "ORGANIC" | "FOOD";

export interface BinSchedule {
	collections: BinCollection[],
	roundTypes: RoundType[],
	isBinStore: boolean,
	events: unknown[],
	containers: BinContainer[],
	// Upstream field: date from which FOOD collections should be shown.
	showFoodWasteCollectionsFrom?: string
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

export async function searchAddress(postCode: string, houseNumber: string): Promise<AddressSearchResponse | undefined> {
	const fetchResult = await fetch(getAddressSearchUri(postCode));
	const json: AddressSearchResponse[] = await fetchResult.json();

	const searchResult = json.find(x => houseNumbersMatch(x.houseNumber, houseNumber));

	return searchResult;
}

const collectionsMatch = (a: BinCollection, b: BinCollection) => {
    if (a.slippedCollection != b.slippedCollection) {
        return false;
    }

    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    return dateA.getFullYear() === dateB.getFullYear()
        && dateA.getMonth() === dateB.getMonth()
        && dateA.getDate() === dateB.getDate();
}

//Sometimes collections for the same day are listed as two separate entries with slightly different times, consolidate them
const consolidateBinSchedule = (input: BinSchedule): BinSchedule => {
    const newCollectionsList: BinCollection[] = [];

    for (const collection of input.collections) {
        const existingEntry = newCollectionsList.find(x => collectionsMatch(x, collection));

        if(existingEntry == null) {
            newCollectionsList.push(collection);
        }
        else {
            existingEntry.roundTypes = existingEntry.roundTypes.concat(collection.roundTypes);
        }
    }

    return {
        ...input,
        collections: newCollectionsList,
    }
}

const getBinScheduleUri = (uprn: string, numberOfCollections: number) => {
	return `${apiHost}collection/search/${uprn}/?numberOfCollections=${numberOfCollections}`;
};

export async function getBinSchedule(uprn: string, numberOfCollections: number = 12): Promise<BinSchedule> {
	const uri = getBinScheduleUri(uprn, numberOfCollections);
	const fetchResult = await fetch(uri);
	const binSchedule: BinSchedule = await fetchResult.json();

	const consolidated = consolidateBinSchedule(binSchedule);
	return applyFoodWasteGating(consolidated);
}

function applyFoodWasteGating(schedule: BinSchedule): BinSchedule {
	const rawShowFrom = schedule.showFoodWasteCollectionsFrom;
	if (rawShowFrom == null || rawShowFrom === "") {
		return schedule;
	}

	const showFrom = toDateAssumingUtc(rawShowFrom);
	if (Number.isNaN(showFrom.getTime())) {
		return schedule;
	}

	const collections = schedule.collections
		.map((c) => {
			const collectionDate = new Date(c.date);
			if (Number.isNaN(collectionDate.getTime())) {
				return c;
			}

			// Upstream currently includes FOOD for all dates, but expects clients to only display it
			// from showFoodWasteCollectionsFrom onwards.
			if (collectionDate < showFrom) {
				return {
					...c,
					roundTypes: c.roundTypes.filter((x) => x !== "FOOD"),
				};
			}

			return c;
		})
		.filter((c) => c.roundTypes.length > 0);

	const roundTypes = unique(collections.flatMap((c) => c.roundTypes));

	const containers = schedule.containers.filter((c) => {
		// Hide FOOD container until it's meant to be shown.
		if (new Date() < showFrom) {
			return c.type !== "FOOD";
		}
		return true;
	});

	return {
		...schedule,
		collections,
		roundTypes,
		containers,
	};
}

function unique<T>(items: T[]): T[] {
	return Array.from(new Set(items));
}

function toDateAssumingUtc(raw: string): Date {
	// Some upstream timestamps omit timezone (e.g. "2026-06-30T00:00:00").
	// Treat these as UTC to avoid local timezone shifting.
	const hasTimeZone = /[zZ]|[+-]\d{2}:\d{2}$/.test(raw);
	return new Date(hasTimeZone ? raw : `${raw}Z`);
}
