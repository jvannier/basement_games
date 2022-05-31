import React, { useEffect, useState } from "react";
import DataGrid from 'react-data-grid';
import { EVENT_COLUMNS } from "../../consts";
import '../Grid.css';


function Events(props) {
    let [adminInfo, setAdminInfo] = useState([]);

    useEffect(() => {
        if (props.isAdmin) {
            setAdminInfo([
                { key: "delete", name: "Delete" },
                { key: "edit", name: "Edit" },
                { key: "id", name: "Event ID" },
            ]);
        } else {
            setAdminInfo([]);
        }
    }, [props.events, props.isAdmin, props.userID]);

    return (
        <DataGrid rows={props.events} columns={
            EVENT_COLUMNS.concat(adminInfo)
        } />
    );
}

export default Events;