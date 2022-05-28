import React, { useEffect, useState } from "react";
// import { make_api_call } from "../api_util";
import DataGrid from 'react-data-grid';
import './Grid.css';


function EditEvents(props) {
    let [editEvents, setEditEvents] = useState();
    useEffect(() => {
        let events = props.events.map(event => {
            event["deletme?"] = "button here?";
            return event;
        });
        setEditEvents(events);
        // Add delete button and ability to edit events? IDK

    }, [props.events]);

    // TODO: Pull the players registered and join button from Events.js after they get added
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
        // TODO: ability to delete events
    );
}

export default EditEvents;