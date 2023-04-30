import { useState } from 'react';
import './App.css';
import { BinFetcherForm } from './BinFetcherForm';
import { Spinner } from './Spinner';
import { BinResult } from './BinResult';

function App() {
  const [fetchingBins, setFetchingBins] = useState(false);
  const [binResult, setBinResult] = useState(null);

  const shouldShowForm = !fetchingBins && binResult === null;

  const onLoadBins = async (postcode) => {
    setFetchingBins(true);
    
    // get bins

    setFetchingBins(false);
    setBinResult("something");
  };

  return (
    <div className="app-wrapper">
      <h1>CamBins</h1>
      {shouldShowForm && <BinFetcherForm onLoadBins={onLoadBins}/>}
      {fetchingBins && <Spinner/>}
      {binResult && <BinResult/>}
    </div>
  );
}

export default App;
