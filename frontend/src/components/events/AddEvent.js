import React, { useEffect, useState } from "react";
import DateTimePicker from 'react-datetime-picker';
import './AddEvent.css';
import { make_api_call } from "../../apiUtil";


function AddEvent(props) {
    const [entryCost, setEntryCost] = useState();
    const [extraDetails, setExtraDetails] = useState();
    const [eventDate, setEventDate] = useState(new Date());
    const [eventName, setEventName] = useState();
    const [eventType, setEventType] = useState("draft");
    const [maxPeople, setMaxPeople] = useState(8);
    const [magicSet, setMagicSet] = useState();

    useEffect(() => {}, [props.isAdmin]);  // Re-render on props.isAdmin change

    function submit(event) {
        event.preventDefault();

        if (props.isAdmin === true) {
            const eventDateAsInt = Date.parse(eventDate);

            // Make API call to create event
            make_api_call(`events/?userID=${props.userID}&token=${props.token}`, "POST", {
                entryCost, extraDetails, eventDateAsInt,
                eventName, eventType, maxPeople, magicSet,
            }).then(res => {
                // Refresh list of events
                props.setRefreshEvents(!props.refreshEvents);
            });

            // Refresh list of events so they render without refresh
            // props.setRefreshEvents(!props.refreshEvents);

            // TODO: Right now it only refreshes after the first one -> if you spam submit it doesn't refresh after the first one. Why?

            // TODO: success message / empty out the input boxes? -> Do we want to just NOT preventDefault?
        }
    }

    return (
        <form method="post" onSubmit={submit} id="add_event">
            <label>
                Name:
                <input type="text" name="event_name" placeholder="Event Name" onChange={(event) => setEventName(event.target.value)} />
            </label>

            <label>
                Date:
                <DateTimePicker value={eventDate} onChange={setEventDate} />
            </label>

            <label>
                Magic Set:
                <input type="text" name="magic_set" placeholder="Magic Set" onChange={(event) => setMagicSet(event.target.value)} />
            </label>

            <label>
                Event Type:
                <input type="text" name="event_type" value={eventType} onChange={(event) => setEventType(event.target.value)} />
            </label>

            <label>
                Max People:
                <input type="number" name="max_people" value={maxPeople} onChange={(event) => setMaxPeople(event.target.value)} />
            </label>

            <label>
                Entry Cost:
                $<input type="number" step="0.01" name="entry_cost" placeholder="Entry Cost" onChange={(event) => setEntryCost(event.target.value)} />
            </label>

            <label>
                Extra Details:
                <textarea name="extra_details" placeholder="Extra Details" onChange={(event) => setExtraDetails(event.target.value)} />
            </label>
            <input type="submit" value="Add Event"></input>

            // TODO: Validate required ones aren't empty
        </form>
    );
}

export default AddEvent;