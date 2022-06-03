import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { make_api_call } from "../../apiUtil";
import DateTimePicker from 'react-datetime-picker';
import Select from 'react-select';
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
    const [players, setPlayers] = useState([]);
    const [users, setUsers] = useState([]);
    
    useEffect(() => {
        async function getData() {
            // Find event to edit
            props.events.forEach(event => {
                if (`${event.id}` === eventID) {
                    // TODO: add/remove signed up ppl + delete(?)
                    setEntryCost(parseFloat(event.entry_cost.substring(1)));
                    setExtraDetails(event.extra_details);
                    setEventDate(event.date);
                    setEventName(event.name);
                    setEventType(event.event_type);
                    let max_people = event.max_people.split("/")[1];  // X/X
                    setMaxPeople(max_people);
                    setMagicSet(event.mtg_set);
                }
            });

            // Get users signed up for each event
            let event_signups = await make_api_call(`events/event_sign_ups/${eventID}`);
            event_signups = event_signups.map(sign_up => {
                return sign_up.user_id;
            });
            event_signups = [...new Set(event_signups)]
            let tempPlayers = [];

            // Get users information
            let users = await make_api_call(`users/?userID=${props.userID}&token=${props.token}`)
            users = users.map(user => {
                let name = `${user.first_name} ${user.last_name}`;
                let formatted_user = {
                    value: name, label: name, id: user.google_id,
                }
                if (event_signups.includes(user.google_id)) {
                    tempPlayers.push(formatted_user);
                }

                return formatted_user;
            });
            setUsers(users);
            setPlayers(tempPlayers);

            // TODO: If event is not found then it'd been deleted -> show user smth?
        }
        getData();
    }, [props.events, props.isAdmin]);  // Re-render on events or isAdmin change

    function submit(event) {
        event.preventDefault();

        if (props.isAdmin === true) {
            const eventDateAsInt = Date.parse(eventDate);

            // Make API call to edit event
            make_api_call(`events/?userID=${props.userID}&token=${props.token}`, "PATCH", {
                entryCost, extraDetails, eventDateAsInt, eventName,
                eventType, maxPeople, magicSet, eventID,
            }).then(res => {
                // Refresh list of events
                props.setRefreshEvents(!props.refreshEvents);
            });

            // Add and remove players based on Select values (players state variable)
            make_api_call(
                `events/join_bulk?userID=${props.userID}&token=${props.token}`,
                "POST",
                {
                    players: JSON.stringify(players.map(player => player.id)),
                    eventID,
                },
            ).then(res => {
                // Refresh list of events
                props.setRefreshEvents(!props.refreshEvents);
            })

            // TODO: success message
            // TODO: Do we want to NOT preventDefault?
        }
    }

    function handleSelectChange (value) {
        if (value.length > maxPeople) {
            alert("Not updating users. Over maximum number of entries.");  // TODO: don't use an alert
        } else {
            setPlayers(value);
        }
    };

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
                <Select 
                    value={players}
                    isMulti
                    options={users}
                    onChange={handleSelectChange}
                    name="colors"
                    className="basic-multi-select"
                    classNamePrefix="select" 
                />
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