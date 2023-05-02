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
