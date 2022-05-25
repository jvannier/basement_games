import React, { useEffect, useState } from "react";
import About from "./components/About";
import Admin from "./components/Admin";
import Events from "./components/Events";
import NavBar from "./components/NavBar";
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { is_logged_in_admin } from "./api_util";


function App() {
  let [userID, setUserID] = useState(localStorage.getItem("id"));
  let [userName, setUserName] = useState();
  let [adminPageLink, setAdminPageLink] = useState("");

  // TODO: vuln: if user is logged in and another person puts their id in localStorage it'll turn up logged in as it is
  //    IDEA: also put where logged in FROM and check that?
  useEffect(() => {
    is_logged_in_admin(userID).then(result => {
      if (result === true) {
        setAdminPageLink(
          <Route exact path="/admin" element={
            <Admin userID={userID} />
          }/>
        );
      } else {
        setAdminPageLink("");
      }
    });
  }, [userID]);

  // TODO: SuspenseAPI stuff (+lazy loading)
  return (
    <div className="App">
      <BrowserRouter>
        <NavBar
          userID={userID} setUserID={setUserID}
          userName={userName} setUserName={setUserName}
        />
        <Routes>
          <Route exact path="/" element={
            <Events/>
          }/>
          <Route exact path="/about" element={
            <About userID={userID} />
          }/>
          {adminPageLink}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
