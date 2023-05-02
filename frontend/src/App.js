import { useState } from 'react';
import './App.css';
import { BinFetcherForm } from './BinFetcherForm';
import { Spinner } from './Spinner';
import { BinResult } from './BinResult';

const baseApiUrl = "https://cambin.olane.workers.dev/";

function App() {
  const [fetchingBins, setFetchingBins] = useState(false);
  const [error, setError] = useState(false);
  const [binResult, setBinResult] = useState(null);

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
      setBinResult(json);
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

  return (
    <div className="app-wrapper">
      <h1>CamBins</h1>
      {shouldShowForm && <BinFetcherForm onLoadBins={onLoadBins}/>}
      {fetchingBins && <Spinner/>}
      {shouldShowResult && <div>
        <BinResult result={binResult} error={error}/>
        <button onClick={onResetForm}>Change address</button>
      </div>}
    </div>
  );
}

export default App;
