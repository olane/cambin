import React, { FC, useState } from "react";

interface BinFetcherFormProps {
    onLoadBins: (postcode: string, houseNumber: string) => void
}

export const BinFetcherForm: FC<BinFetcherFormProps> = ({onLoadBins}) => {
    const [postcode, setPostcode] = useState("");
    const [houseNumber, setHouseNumber] = useState("");

    const loadBins = () => {
        onLoadBins(postcode, houseNumber);
    };

    return (
        <div className="bin-form">
            <label>Postcode: <input type='text' onChange={e => setPostcode(e.target.value)} placeholder='CB1 1AA'></input></label>
            <label>House number: <input type='text' onChange={e => setHouseNumber(e.target.value)} placeholder='99'></input></label>
            <button className="standard-button primary" onClick={loadBins}>Bin me</button>
        </div>
    );
}
