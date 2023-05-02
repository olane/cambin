
function renderSingleCollection(collection) {
    const roundTypesString = collection.roundTypes.join(" and ");

    return (<p>{roundTypesString} collection on {collection.date}</p>)
}

export function BinResult({result, error}) {
    if(error) {
        return (<div>oh no</div>);
    }

    const collections = result.collections.map(renderSingleCollection);

    return (
        <div className="bin-result">
            {collections}
        </div>
    );
}
