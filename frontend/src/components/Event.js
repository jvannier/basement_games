function Event(props) {
    // TODO: will need to convert dates from UTC (in DB) to user's timezone
    // button to join && unjoin event iff user is logged in
    
    return (
        <div>
            {JSON.stringify(props)}
        </div>
    );
}

export default Event;