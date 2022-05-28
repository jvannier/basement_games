import React, { useEffect, useState } from "react";
import AddEvent from "./AddEvent";
import EditEvents from "./EditEvents";
import Users from "./Users";


function Admin(props) {
    let [page, setPage] = useState(
        <AddEvent
            userID={props.userID}
            token={props.token}
            isAdmin={props.isAdmin}
        />
    );

    useEffect(() => {}, [props.isAdmin]);  // Re-render on props.isAdmin change

    if (props.isAdmin !== true) {  // If not admin refuse to render
        return (
            <div>
                RESTRICTED ACCESS
            </div>
        );
    }

    return (
        <div>
            <p>TODO: SUPER SECRET ADMIN STUFF</p>

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
                    <EditEvents events={props.events}/>
                // <div>TODO
                    // {/* seeing who has signed up, checkbox for who has paid(?), delete button */}

                    // {/* {JSON.stringify(events)} */}
                // </div>
                );
            }}>Edit Events</button>

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