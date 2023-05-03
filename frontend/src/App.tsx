import React, { useState, useEffect } from 'react';
import './App.css';
import { BinFetcherForm } from './BinFetcherForm';
import { Spinner } from './Spinner';
import { BinResult } from './BinResult';
import { AddressSearchResponse, BinSchedule } from './BinTypes';
import { getBins } from './BinService';

const renderMainSection = (
  fetchingBins: boolean,
  error: boolean,
  onLoadBins: (postcode: string, houseNumber: string) => Promise<void>,
  onResetForm: () => void,
  binResult?: BinSchedule,
  addressResult?: AddressSearchResponse) => {

  const shouldShowForm = !fetchingBins && binResult === null && error === false;

  if(shouldShowForm) {
    return <BinFetcherForm onLoadBins={onLoadBins}/>;
  }
  else if(fetchingBins) {
    return <Spinner />;
  }
  else if(binResult != null && addressResult != null) {
    return (
      <div>
        <BinResult result={binResult} address={addressResult}/>
        <button className="standard-button" onClick={onResetForm}>Change address</button>
      </div>
    );
  }
  else if (error) {
    return <div>Error!</div>
  }
}

function App() {
  const [fetchingBins, setFetchingBins] = useState(false);
  const [error, setError] = useState(false);
  const [binResult, setBinResult] = useState<BinSchedule>();
  const [addressResult, setAddressResult] = useState<AddressSearchResponse>();

  const onLoadBins = async (postcode: string, houseNumber: string) => {
    setFetchingBins(true);

    // get bins
    try {
      const result = await getBins(postcode, houseNumber);
      setBinResult(result.schedule);
      setAddressResult(result.address);
      localStorage.setItem("postcode", postcode);
      localStorage.setItem("houseNumber", houseNumber);
    }
    catch(e) {
      setError(true)
    }

    setFetchingBins(false);
  };

  const onResetForm = () => {
    setFetchingBins(false);
    setError(false);
    setBinResult(undefined);
  };
  
  useEffect(() => {
    const postcode = localStorage.getItem("postcode");
    const houseNumber = localStorage.getItem("houseNumber");

    if(postcode && houseNumber){
      onLoadBins(postcode, houseNumber);
    }
  }, []);

  return (
    <div className="app-wrapper">
      <h1>CamBins</h1>
      {renderMainSection(fetchingBins, error, onLoadBins, onResetForm, binResult, addressResult)}
    </div>
  );
}

export default App;

