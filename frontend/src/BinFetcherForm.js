import { useState } from "react";

export function BinFetcherForm({onLoadBins}) {
    const [postcode, setPostcode] = useState("");
    const [houseNumber, setHouseNumber] = useState("");

    const loadBins = () => {
        onLoadBins(postcode, houseNumber);
    };

    return (
        <div className="bin-form">
            <label>Postcode: <input type='text' onChange={e => setPostcode(e.target.value)}></input></label>
            <label>House number: <input type='text' onChange={e => setHouseNumber(e.target.value)}></input></label>
            <button onClick={loadBins}>Bin Me</button>
        </div>
    );
}
