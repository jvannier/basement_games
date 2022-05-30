import Select from 'react-select';
import { make_api_call } from "../apiUtil";
import DeleteEvent from "./DeleteEvent";
import JoinEvent from "./JoinEvent";
import LeaveEvent from "./LeaveEvent";


async function get_events(
    userID,
    token,
    setEvents,
    refreshEvents,
    setRefreshEvents,
) {
    // Get users signed up for each event
    let event_signups_db_call = await make_api_call(`events/event_sign_ups`);
    let event_signups = {};  // Events to users signed up for them
    event_signups_db_call.forEach(sign_up => {
        if (event_signups[sign_up["event_id"]] === undefined) {
            event_signups[sign_up["event_id"]] = [sign_up["user_id"]];
        } else {
            event_signups[sign_up["event_id"]].push(sign_up["user_id"]);
        }
    });

    // Get users' names based on google_id
    let users_db_call = await make_api_call('users/names');
    let user_id_to_name = {};
    users_db_call.forEach(user => {
        user_id_to_name[user["google_id"]] = (
            user["first_name"] + " " + user["last_name"]
        );
    });

    let data = await make_api_call(`events/`);
    data = data.map(event => {
        // Convert date from UTC (in DB) to user's timezone
        event["date"] = new Date(event["date"]).toString();

        // Get people signed up for THIS event
        let signed_up_people = (
            event_signups[event["id"]] !== undefined ? event_signups[event["id"]] : []
        );

        // Show people signed up for this event
        let players = signed_up_people.map(
            player => user_id_to_name[player]
        );
        event["players"] = (
            <select name="players" id="players">
                {
                    players.map(player =>
                        <option value={player}>{player}</option>
                    )
                }
            </select>
        );

        event["max_people"] = `${signed_up_people.length}/${event["max_people"]}`;
        event["entry_cost"] = `$${event["entry_cost"]}`;  // Add $ to cost

        // If user is signed up for event show "Leave" button instead of "Join"
        if (signed_up_people.includes(userID)) {
            // Add Leave Button
            event["join"] = (
                <LeaveEvent
                    userID={userID}
                    token={token}
                    events={data}
                    refreshEvents={refreshEvents}
                    setRefreshEvents={setRefreshEvents}
                />
            );
        } else {
            // Add Join Button
            event["join"] = (
                <JoinEvent
                    userID={userID}
                    token={token}
                    events={data}
                    refreshEvents={refreshEvents}
                    setRefreshEvents={setRefreshEvents}
                />
            );
        }

        // Add Delete Button
        event["delete"] = (
            <DeleteEvent
                userID={userID}
                token={token}
                events={data}
                refreshEvents={refreshEvents}
                setRefreshEvents={setRefreshEvents}
            />
        );
        return event;
    });
    setEvents(data);
}


export { get_events };