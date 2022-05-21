import React, { useEffect, useState } from "react";
import './App.css';


function App() {
  const [results, setResults] = useState("NO RESULTS")
  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `https://basement-games.herokuapp.com/users`,
        {
          headers: {
            "Access-Control-Allow-Origin": "0.0.0.0"
          }
        }
      );
      const data = await response.json()
      setResults(data);
    }
    fetchData();
  });

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
