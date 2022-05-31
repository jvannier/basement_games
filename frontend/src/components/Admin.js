import React, { useState } from "react";
import AddEvent from "./events/AddEvent";
import Users from "./Users";


function Admin(props) {
    let [page, setPage] = useState(
        <AddEvent
            userID={props.userID}
            token={props.token}
            isAdmin={props.isAdmin}
            refreshEvents={props.refreshEvents}
            setRefreshEvents={props.setRefreshEvents}
        />
    );

    if (props.isAdmin !== true) {  // If not admin refuse to render
        return (
            <div>
                RESTRICTED ACCESS
            </div>
        );
    }

    // TODO: use browser router instead of buttons here (can update url then -> remember to host them in server.js then :D)
    return (
        <div>
            <p>SUPER SECRET ADMIN STUFF</p>

            <button onClick={() => {
                setPage(
                    <AddEvent
                        userID={props.userID}
                        token={props.token}
                        isAdmin={props.isAdmin}
                        refreshEvents={props.refreshEvents}
                        setRefreshEvents={props.setRefreshEvents}
                    />
                );
            }}>Add Event</button>

            <button onClick={() => {
                setPage(
                    <Users
                        userID={props.userID}
                        token={props.token}
                        isAdmin={props.isAdmin}
                    />
                );
            }}>View Users</button>

            {page}
        </div>
    )
}

export default Admin;