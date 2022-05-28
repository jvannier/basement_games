import React, { useEffect, useState } from "react";
import DataGrid from 'react-data-grid';
import { make_api_call } from "../api_util";
import './Grid.css';


function Users(props) {
    let [users, setUsers] = useState([]);
    useEffect(() => {
        make_api_call(`users/?userID=${props.userID}&token=${props.token}`).then(data => {
            data = data.map(user => {
                // TODO: will need to convert dates from UTC (in DB) to user's timezone

                delete user.google_id;  // User doesn't need to see the event id
                return user;
            });
            setUsers(data);
        });
    }, [props.token, props.isAdmin]);

    // TODO: Show what events the user is signed up for
    return (
        <DataGrid rows={users} columns={[
            { key: "first_name", name: "First Name" },
            { key: "last_name", name: "Last Name" },
            { key: "email", name: "Email" },
            { key: "account_created", name: "Account Created" },
            { key: "last_login", name: "Last Login" },
        ]} />
    );
}

export default Users;