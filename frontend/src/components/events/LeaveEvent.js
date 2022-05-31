import { make_api_call } from "../../apiUtil";


function LeaveEvent(props) {
    async function leaveEvent(event) {
        let row = event.target.parentNode.parentNode.getAttribute("aria-rowindex");
        row -= 2;  // Header row + starts at 1
    
        make_api_call(
            `events/leave?userID=${props.userID}&token=${props.token}&eventID=${props.events[row].id}`,
            "POST",
        ).then(res => {
            props.setRefreshEvents(!props.refreshEvents);
        });
    }

    return (
        <button class="leave" onClick={leaveEvent} >
            Leave
        </button>
    );
}

export default LeaveEvent;