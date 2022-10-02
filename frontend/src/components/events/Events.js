import React, { useEffect, useState } from "react";
import { EVENT_COLUMNS } from "../../consts";
import Row from "../Row.js";
import {Table, Thead, Tbody, Tr, Th} from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
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

    let columns = EVENT_COLUMNS.concat(adminInfo);
    return (
        <Table role="grid">
            <Thead>
                <Tr>
                    {columns.map(row => <Th scope="col">{row["name"]}</Th>)}
                </Tr>
            </Thead>
            <Tbody>
                {props.events.map(event =>
                    <Row columns={columns} row={event}/>
                )}
            </Tbody>
        </Table>
    );
}

export default Events;