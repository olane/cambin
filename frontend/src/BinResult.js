function isToday (date) { 
    const tomorrow = new Date();
    return isSameDate(date, tomorrow);
}

function isTomorrow (date) { 
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isSameDate(date, tomorrow);
}

function isSameDate(date1, date2) {
    return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
}

function renderSingleCollection(collection) {
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

    return (<p>{roundTypesString} collection on {dateString}{collection.slippedCollection && " - RESCHEDULED"}</p>)
}

function addressToString(address) {
    const toCapsCase = (str) => str
        .split(' ')
        .map(x => x.toLocaleLowerCase())
        .map(x => x.charAt(0).toLocaleUpperCase() + x.slice(1))
        .join(" ");

    return `${address.houseNumber} ${toCapsCase(address.street)}`;
}

export function BinResult({result, address, error}) {
    if(error) {
        return (<div>Error: {error}</div>);
    }

    const collectionsRendered = result.collections.map(renderSingleCollection);

    return (
        <div className="bin-result">
            <h2>Upcoming collections for {addressToString(address)}:</h2>
            {collectionsRendered}
        </div>
    );
}
