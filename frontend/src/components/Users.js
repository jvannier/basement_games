import React, { useEffect, useState } from "react";
import DataGrid from 'react-data-grid';
import { make_api_call } from "../apiUtil";
import './Grid.css';


function Users(props) {
    let [users, setUsers] = useState([]);
    useEffect(() => {
        async function users() {
            // Get users signed up for each event
            let event_signups_db_call = await make_api_call(`events/event_sign_ups`);
            let event_signups = {};  // Users to events signed up for
            event_signups_db_call.forEach(sign_up => {
                if (event_signups[sign_up["user_id"]] === undefined) {
                    event_signups[sign_up["user_id"]] = [sign_up["event_id"]];
                } else {
                    event_signups[sign_up["user_id"]].push(sign_up["event_id"]);
                }
            });

            // Get users information
            let users = await make_api_call(`users/?userID=${props.userID}&token=${props.token}`)
            users = users.map(user => {
                // Convert dates from UTC (in Database) to user's browser's timezone
                user["account_created"] = new Date(user["account_created"]).toString();
                user["last_login"] = new Date(user["last_login"]).toString();

                // Add events joined information
                let user_event_signups = (
                    event_signups[user["google_id"]] !== undefined ? event_signups[user["google_id"]] : []
                );

                user["events_joined"] = user_event_signups.sort().join(", ");

                return user;
            });
            setUsers(users);
        }
        users();
    }, [props.token, props.isAdmin]);

    return (
        <DataGrid rows={users} columns={[
            { key: "first_name", name: "First Name" },
            { key: "last_name", name: "Last Name" },
            { key: "email", name: "Email" },
            { key: "account_created", name: "Account Created" },
            { key: "last_login", name: "Last Login" },
            { key: "events_joined", name: "Events Joined" },
        ]} />
    );
}

export default Users;