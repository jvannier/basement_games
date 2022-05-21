import React, { useEffect, useState } from "react";
import './App.css';


function App() {
  const [results, setResults] = useState("NO RESULTS")
  useEffect(async () => {
    const response = await fetch(
      `https://basement-games.herokuapp.com/`
    );
    const data = await response.json()
    setResults(data);
  }, [results]);

  return (
    <div className="App">
      <header className="App-header">
        Test
        { results }
      </header>
    </div>
  );
}

export default App;
