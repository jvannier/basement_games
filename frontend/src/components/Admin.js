import React, { useEffect, useState } from "react";
import AddEvent from "./AddEvent";
// import EditEvents from "./EditEvents";
import Users from "./Users";


function Admin(props) {
    let [page, setPage] = useState(
        <AddEvent
            userID={props.userID}
            token={props.token}
            isAdmin={props.isAdmin}
        />
    );

    if (props.isAdmin !== true) {  // If not admin refuse to render
        return (
            <div>
                RESTRICTED ACCESS
            </div>
        );
    }

    return (
        <div>
            <p>SUPER SECRET ADMIN STUFF</p>

            <button onClick={() => {
                setPage(
                    <AddEvent
                        userID={props.userID}
                        token={props.token}
                        isAdmin={props.isAdmin}
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