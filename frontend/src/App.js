import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import About from "./components/About";
import Admin from "./components/Admin";
import Events from "./components/Events";
import NavBar from "./components/NavBar";
import './App.css';
import { is_logged_in_admin } from "./apiUtil";
import { make_api_call } from "./apiUtil";
import DeleteEvent from "./components/DeleteEvent";
import { get_events } from "./components/eventsUtil";


function App() {
  let [userID, setUserID] = useState(localStorage.getItem("id"));
  let [userName, setUserName] = useState();
  let [token, setToken] = useState(localStorage.getItem("token"));
  let [isAdmin, setIsAdmin] = useState(false);

  // Store events att App level so they're available everywhere:
  let [events, setEvents] = useState([]);
  let [refreshEvents, setRefreshEvents] = useState(false);  // change flag to force refresh events

  let [adminPageLink, setAdminPageLink] = useState("");

  useEffect(() => {
    is_logged_in_admin(userID, token).then(result => {
      if (result === true) {
        setAdminPageLink(
          <Route exact path="/admin" element={
            <Admin
              userID={userID}
              token={token}
              isAdmin={isAdmin}
              events={events}
              setEvents={setEvents}
              refreshEvents={refreshEvents}
              setRefreshEvents={setRefreshEvents}
            />
          }/>
        );
      } else {
        setAdminPageLink("");
      }
      setIsAdmin(result);
    });
  }, [token, isAdmin]);

  useEffect(() => {
    // Get events here so avail everywhere
    get_events(
      userID,
      token,
      events,
      setEvents,
      refreshEvents,
      setRefreshEvents,
    );
  }, [refreshEvents]);

  // TODO: SuspenseAPI stuff (+lazy loading)
  // TODO: Make it so can refresh on route (i.e. /admin or /about) and have it still work
  return (
    <div className="App">
      <BrowserRouter>
        <NavBar
          userID={userID} setUserID={setUserID}
          userName={userName} setUserName={setUserName}
          token={token} setToken={setToken}
        />
        <Routes>
          <Route exact path="/" element={
            <Events
              userID={userID}
              isAdmin={isAdmin}
              events={events}
            />
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
