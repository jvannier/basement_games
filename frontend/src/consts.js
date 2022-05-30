const API_URL = "https://basement-games.herokuapp.com";
const CLIENT_ID = process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID;

const EVENT_COLUMNS = [
    { key: "name", name: "Name" },
    { key: "date", name: "Date" },
    { key: "mtg_set", name: "Set" },
    { key: "event_type", name: "Event Type" },
    { key: "max_people", name: "Spots Filled" },
    { key: "entry_cost", name: "Entry Cost" },
    { key: "extra_details", name: "Details" },
    { key: "join", name: "Join" },
    { key: "players", name: "Players" },
];

export { API_URL, CLIENT_ID, EVENT_COLUMNS };