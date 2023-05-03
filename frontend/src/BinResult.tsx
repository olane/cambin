import React, {FC} from 'react';
import { AddressSearchResponse, BinCollection, BinSchedule } from './BinTypes';
import { isThisWeek, isToday, isTomorrow } from './dateUtils';

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

const renderSection = (collections: BinCollection[], sectionName: string) => {
    if(collections.length === 0) {
        return null;
    }

    return (
        <>
            <h3>{sectionName}</h3>
            {collections.map(renderSingleCollection)}
        </>
    )
}

export const BinResult : FC<BinResultProps> = ({result, address}) => {
    const collections = result.collections;

    const collectionsToday = collections.filter(x => isToday(x.date));
    const collectionsTomorrow = collections.filter(x => isTomorrow(x.date));
    const collectionsThisWeekButNotTodayOrTomorrow = collections.filter(x => isThisWeek(x.date) && !isToday(x.date) && !isTomorrow(x.date));
    const collectionsNotThisWeek = collections.filter(x => !isThisWeek(x.date));

    return (
        <div className="bin-result">
            <h2>{addressToString(address)}</h2>
            {renderSection(collectionsToday, "Today")}
            {renderSection(collectionsTomorrow, "Tomorrow")}
            {renderSection(collectionsThisWeekButNotTodayOrTomorrow, "This week")}
            {renderSection(collectionsNotThisWeek, "Upcoming")}
        </div>
    );
}
