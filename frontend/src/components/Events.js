import React, { useEffect, useState } from "react";
import { make_api_call } from "../api_util";


function Events(props) {
    const [events, setEvents] = useState("NO EVENTS");
    useEffect(() => {
        make_api_call(`events/`).then(data => {
            setEvents(data.rows);
        });
    }, []);

    // Show players registered, join button, date, (no prizing info? -> or just an extra field brett can type into) -> further details
    return (
        <div>
            // dropdown with list of events? (default on most recent one)

            // TODO: will need to convert dates from UTC (in DB) to user's timezone

            TODO: events

            |{JSON.stringify(events)}|
        
            // button to join && unjoin event
        </div>
    );
}

export default Events;