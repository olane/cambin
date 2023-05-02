import React, { useState, useEffect } from 'react';
import './App.css';
import { BinFetcherForm } from './BinFetcherForm';
import { Spinner } from './Spinner';
import { BinResult } from './BinResult';
import { AddressSearchResponse, BinSchedule } from './BinTypes';

const baseApiUrl = "https://cambin.olane.workers.dev/";

const renderMainSection = (
  fetchingBins: boolean,
  error: boolean,
  onLoadBins: (postcode: string, houseNumber: string) => Promise<void>,
  onResetForm: () => Promise<void>,
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
  const [binResult, setBinResult] = useState(null);
  const [addressResult, setAddressResult] = useState(null);

  const onLoadBins = async (postcode: string, houseNumber: string) => {
    setFetchingBins(true);

    // get bins
    const fetchUrl = baseApiUrl + `bins?postCode=${encodeURIComponent(postcode)}&houseNumber=${encodeURIComponent(houseNumber)}`;
    const result = await fetch(fetchUrl, {
      method: "GET",
      headers: {
        Accept: 'application/json',
      }
    });

    if (result.ok) {
      const json = await result.json();
      setBinResult(json.schedule);
      setAddressResult(json.address);
      localStorage.setItem("postcode", postcode);
      localStorage.setItem("houseNumber", houseNumber);
    }
    else {
      setError(true)
    }

    setFetchingBins(false);
  };

  const onResetForm = () => {
    setFetchingBins(false);
    setError(false);
    setBinResult(null);
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
