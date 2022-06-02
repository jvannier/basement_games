import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { make_api_call } from "../../apiUtil";
import DateTimePicker from 'react-datetime-picker';
import './EditEvent.css';


function EditEvent(props) {
    const { eventID } = useParams();
    const [entryCost, setEntryCost] = useState();
    const [extraDetails, setExtraDetails] = useState();
    const [eventDate, setEventDate] = useState(new Date());
    const [eventName, setEventName] = useState();
    const [eventType, setEventType] = useState("draft");
    const [maxPeople, setMaxPeople] = useState(8);
    const [magicSet, setMagicSet] = useState();
    // TODO: ability to add / remove signed up people -> react-select had the multi select thing + in pills. get users from /users then could click add or remove.
    
    useEffect(() => {
        // Find event to edit
        props.events.forEach(event => {
            if (`${event.id}` === eventID) {
                console.log("event to edit:", event);

                // TODO: add/remove signed up ppl + delete(?)
                setEntryCost(event.entry_cost);
                setExtraDetails(event.extra_details);
                setEventDate(event.date);
                setEventName(event.name);
                setEventType(event.event_type);
                setMaxPeople(event.max_people);
                setMagicSet(event.mtg_set);
            }
        });

        // TODO: If event is not found then it'd been deleted -> show user smth?
    }, [props.events, props.isAdmin]);  // Re-render on events or isAdmin change

    function submit(event) {
        event.preventDefault();

        if (props.isAdmin === true) {
            console.log("do the thing");

            // const eventDateAsInt = Date.parse(eventDate);

            // Make API call to edit event
            // make_api_call(`events/?userID=${props.userID}&token=${props.token}`, "POST", {
            //     props.entryCost, props.extraDetails, props.eventDateAsInt,
            //     props.eventName, props.eventType, props.maxPeople,
            //     props.magicSet,
            // }).then(res => {
            //     // Refresh list of events
            //     props.setRefreshEvents(!props.refreshEvents);
            // });

            // TODO: HAve this cause a regrab of events (refreshEvents)

            // TODO: success message
            // TODO: Do we want to NOT preventDefault?
        }
    }

    return (
        <form method="post" onSubmit={submit} id="edit_event">
            <label>ID: {eventID}</label>
            <label>
                Name:
                <input type="text" name="event_name" value={eventName} onChange={(event) => setEventName(event.target.value)} />
            </label>

            <label>
                Date:
                <DateTimePicker value={eventDate} onChange={setEventDate} />
            </label>

            <label>
                Magic Set:
                <input type="text" name="magic_set" value={magicSet} onChange={(event) => setMagicSet(event.target.value)} />
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
                $<input type="number" step="0.01" name="entry_cost" value={entryCost} onChange={(event) => setEntryCost(event.target.value)} />
            </label>

            <label>
                Signed Up Users:
                 TODO: list in select (in pill form) + buttons to remove/add ppl?
            </label>

            <label>
                Extra Details:
                <textarea name="extra_details" value={extraDetails} onChange={(event) => setExtraDetails(event.target.value)} />
            </label>
            <input type="submit" value="Edit Event"></input>
        </form>
    );
}

export default EditEvent;