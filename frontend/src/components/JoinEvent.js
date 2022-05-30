import { make_api_call } from "../apiUtil";


function JoinEvent(props) {
    async function joinEvent(event) {
        let row = event.target.parentNode.parentNode.getAttribute("aria-rowindex");
        row -= 2;  // Header row + starts at 1
        console.log("event to join: ", props.events[row])
    
        make_api_call(
            `events/join?userID=${props.userID}&token=${props.token}&eventID=${props.events[row].id}`,
            "POST",
        ).then(res => {
            props.setRefreshEvents(!props.refreshEvents);
        });
    }

    return (
        <button class="join" onClick={joinEvent} >
            Join
        </button>
    );
}

export default JoinEvent;