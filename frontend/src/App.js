import { useState, useEffect } from 'react';
import './App.css';
import { BinFetcherForm } from './BinFetcherForm';
import { Spinner } from './Spinner';
import { BinResult } from './BinResult';

const baseApiUrl = "https://cambin.olane.workers.dev/";

function App() {
  const [fetchingBins, setFetchingBins] = useState(false);
  const [error, setError] = useState(false);
  const [binResult, setBinResult] = useState(null);
  const [addressResult, setAddressResult] = useState(null);

  const onLoadBins = async (postcode, houseNumber) => {
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

  const shouldShowForm = !fetchingBins && binResult === null && error === false;
  const shouldShowResult = binResult || error;

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
      {shouldShowForm && <BinFetcherForm onLoadBins={onLoadBins}/>}
      {fetchingBins && <Spinner/>}
      {shouldShowResult && <div>
        <BinResult result={binResult} address={addressResult} error={error}/>
        <button onClick={onResetForm}>Change address</button>
      </div>}
    </div>
  );
}

export default App;
