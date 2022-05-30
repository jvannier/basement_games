import { make_api_call } from "../apiUtil";
import DeleteEvent from "./DeleteEvent";
import JoinEvent from "./JoinEvent";


function get_events(
    userID,
    token,
    events,
    setEvents,
    refreshEvents,
    setRefreshEvents,
) {
    make_api_call(`events/`).then(data => {
        data = data.map(event => {
            // TODO: will need to convert dates from UTC (in DB) to user's timezone
            // button to join && unjoin event iff user is logged in

            // TODO: Make "spots" be ? / max and get the ? from the DB
            event["max_people"] = `0/${event["max_people"]}`;

            event["entry_cost"] = `\$${event["entry_cost"]}`;  // Add $ to cost

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
    });
}


export { get_events };