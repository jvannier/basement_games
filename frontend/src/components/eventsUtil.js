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
            event_signups[sign_up["event_id"]].push([sign_up["user_id"]]);
        }
    });

    let data = await make_api_call(`events/`);
    data = data.map(event => {
        // TODO: will need to convert dates from UTC (in DB) to user's timezone
        // TODO: Add dropdown with list of names of signed up people? Should this be admin only?

        // Get people signed up for THIS event
        let signed_up_people = (
            event_signups[event["id"]] !== undefined ? event_signups[event["id"]] : []
        ); 
        
        event["max_people"] = `${signed_up_people.length}/${event["max_people"]}`;
        event["entry_cost"] = `$${event["entry_cost"]}`;  // Add $ to cost

        // TODO: rename "Join" column so it's clearer it's both join and leave?
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