import React, { useEffect, useState } from "react";
import { is_logged_in_admin, make_api_call } from "../api_util";


function Admin(props) {
    let [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        is_logged_in_admin(props.userID).then(result => {
            setIsAdmin(result);
        });
    }, []);

    if (isAdmin === true) {
        return (
            <div>TODO: SUPER SECRET ADMIN STUFF - adding events / seeing who has signed up, checkbox for who has paid(?)</div>
        )
    } else {
        return (
            <div>
                RESTRICTED ACCESS
            </div>
        );
    }
}

export default Admin;