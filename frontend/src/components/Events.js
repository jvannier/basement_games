import React, { useEffect, useState } from "react";
import { make_api_call } from "../api_util";
import Event from "./Event";


function Events(props) {
    const [events, setEvents] = useState(["NO EVENTS"]);
    useEffect(() => {
        make_api_call(`events/`).then(data => {
            setEvents(data);
        });
    }, []);

    // Show players registered, join button, date, (no prizing info? -> or just an extra field brett can type into) -> further details
    return (
        <div>
            {
                events.map(event => {
                    return <Event event={event}/>
                })
            }
        </div>
    );
    // TODO: dropdown with list of events? (default on most recent one)
}

export default Events;