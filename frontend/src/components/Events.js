import React, { useEffect, useState } from "react";
import DataGrid from 'react-data-grid';
import { EVENT_COLUMNS } from "../consts";
import './Grid.css';


function Events(props) {
    let [adminInfo, setAdminInfo] = useState([]);

    useEffect(() => {
        if (props.isAdmin) {
            setAdminInfo([
                { key: "delete", name: "Delete" },
            ]);
        } else {
            setAdminInfo([]);
        }
    }, [props.events, props.isAdmin, props.userID]);

    // TODO: Show players registered, join button
    return (
        <DataGrid rows={props.events} columns={
            EVENT_COLUMNS.concat(adminInfo)
        } />
    );
}

export default Events;