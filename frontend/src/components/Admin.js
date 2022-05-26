import React, { useEffect, useState } from "react";
import { is_logged_in_admin, make_api_call } from "../api_util";
import AddEvent from "./AddEvent";


function Admin(props) {
    let [events, setEvents] = useState("NO EVENTS");
    let [page, setPage] = useState(<AddEvent events={events}/>);
    let [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        is_logged_in_admin(props.userID, props.token).then(result => {
            setIsAdmin(result);
        });

        if (isAdmin === true) {
            make_api_call(`events/`).then(data => {
                setEvents(data.rows);
            });
        }
    }, [props.userID]);

    if (isAdmin !== true) {  // If not admin refuse to render
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
                setPage(<AddEvent isAdmin={isAdmin}/>);
            }}>Add Event</button>

            <button onClick={() => {
                setPage(<div>TODO
                    seeing who has signed up, checkbox for who has paid(?)

                    {JSON.stringify(events)}
                </div>);
            }}>Edit Event</button>

            <button onClick={() => {
                setPage(<div>TODO</div>);
            }}>View Users</button>

            {page}
        </div>
    )
}

export default Admin;