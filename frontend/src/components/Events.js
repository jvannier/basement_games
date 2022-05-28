import React, { useEffect, useState } from "react";
import { make_api_call } from "../api_util";
import DataGrid from 'react-data-grid';
import './Grid.css';


function Events(props) {
    useEffect(() => {
        make_api_call(`events/`).then(data => {
            data = data.map(event => {
                // TODO: will need to convert dates from UTC (in DB) to user's timezone
                // button to join && unjoin event iff user is logged in

                // TODO: Make "spots" be ? / max and get the ? from the DB
                event["max_people"] = `0/${event["max_people"]}`;

                event["entry_cost"] = `\$${event["entry_cost"]}`;  // Add $ to cost
                delete event.id;  // User doesn't need to see the event id
                return event;
            });
            props.setEvents(data);
        });
    }, [props.events]);

    // TODO: Show players registered, join button
    return (
        <DataGrid rows={props.events} columns={[
            { key: "name", name: "Name" },
            { key: "date", name: "Date" },
            { key: "mtg_set", name: "Set" },
            { key: "event_type", name: "Event Type" },
            { key: "max_people", name: "Spots Filled" },
            { key: "entry_cost", name: "Entry Cost" },
            { key: "extra_details", name: "Details" },
        ]} />
        //     {/* Add column for join button? Or a check box or smth? */}
        //     {/* Add column for signed up players -> will need to get from DB from junction table */}
    );
}

export default Events;