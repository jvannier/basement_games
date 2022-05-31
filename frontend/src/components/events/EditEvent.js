import { make_api_call } from "../../apiUtil";


function EditEvent(props) {

    async function editEvent (clickEvent) {
        // Delete event in the same row as the clicked delete button
        let row = clickEvent.target.parentNode.parentNode.getAttribute("aria-rowindex");
        row -= 2;  // Header row + starts at 1
        // go to new page -> edit event
        // make_api_call(
        //     `events/?userID=${props.userID}&token=${props.token}&eventID=${props.events[row].id}`,
        //     "DELETE",
        // ).then(res => {
        //     props.setRefreshEvents(!props.refreshEvents);
        // });
    }

    return (
        <button class="edit" onClick={editEvent} >
            Edit
        </button>
    );
}

export default EditEvent;