import { useNavigate } from 'react-router-dom';


function EditEventButton(props) {
    const navigate = useNavigate();

    async function editEvent (clickEvent) {
        // Delete event in the same row as the clicked delete button
        let row = clickEvent.target.parentNode.parentNode.getAttribute("aria-rowindex");
        row -= 2;  // Header row + starts at 1

        console.log("editing", props.events[row]);  // TODO: remove
        // Got to page for editing the selected event
        navigate(`/admin/edit_event/${props.events[row].id}`);
    }

    return (
        <button class="edit" onClick={editEvent} >
            Edit
        </button>
    );
}

export default EditEventButton;