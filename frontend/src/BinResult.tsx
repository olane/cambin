import React, {FC} from 'react';
import { AddressSearchResponse, BinCollection, BinSchedule } from './BinTypes';
import { isToday, isTomorrow } from './dateUtils';

interface BinResultProps {
    result: BinSchedule,
    address: AddressSearchResponse
}

function renderSingleCollection(collection: BinCollection, i: number) {
    const roundTypesString = collection.roundTypes.join(" and ");

    let dateString = collection.date.toLocaleDateString(
        'en-gb',
        {
            weekday: "long",
            month: 'long',
            day: 'numeric',
        }
    );
    
    if(isToday(collection.date)) {
        dateString += " (today!)";
    }
    
    if(isTomorrow(collection.date)) {
        dateString += " (tomorrow!)";
    }

    return (<p key={i}>{roundTypesString} collection on {dateString}{collection.slippedCollection && " - RESCHEDULED"}</p>)
}

function addressToString(address: AddressSearchResponse) {
    const toCapsCase = (str: string) => str
        .split(' ')
        .map(x => x.toLocaleLowerCase())
        .map(x => x.charAt(0).toLocaleUpperCase() + x.slice(1))
        .join(" ");

    return `${address.houseNumber} ${toCapsCase(address.street)}`;
}

export const BinResult : FC<BinResultProps> = ({result, address}) => {
    const collectionsRendered = result.collections.map((x, i) => renderSingleCollection(x, i));

    return (
        <div className="bin-result">
            <h2>Upcoming collections for {addressToString(address)}:</h2>
            {collectionsRendered}
        </div>
    );
}
