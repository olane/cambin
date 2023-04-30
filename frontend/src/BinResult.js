
export function BinResult({result, error}) {
    if(error) {
        return (<div>oh no</div>);
    }

    return (
        <div className="bin-result">
            {result.collections[0].roundTypes[0]}
        </div>
    );
}
