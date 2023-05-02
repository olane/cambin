import React, {FC} from 'react';
import { AddressSearchResponse, BinCollection, BinSchedule } from './BinTypes';

interface BinResultProps {
    result: BinSchedule,
    address: AddressSearchResponse
}

function isToday (date: Date) { 
    const tomorrow = new Date();
    return isSameDate(date, tomorrow);
}

function isTomorrow (date: Date) { 
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isSameDate(date, tomorrow);
}

function isSameDate(date1: Date, date2: Date) {
    return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
}

function renderSingleCollection(collection: BinCollection, i: number) {
    const roundTypesString = collection.roundTypes.join(" and ");

    const date = new Date(collection.date);

    let dateString = date.toLocaleDateString(
        'en-gb',
        {
            weekday: "long",
            month: 'long',
            day: 'numeric',
        }
    );
    
    if(isToday(date)) {
        dateString += " (today!)";
    }
    
    if(isTomorrow(date)) {
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
