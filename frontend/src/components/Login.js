import jwt_decode from "jwt-decode";
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import React, { useEffect } from "react";
import { make_api_call } from "../api_util";


function Login(props) {
    function login(id, name) {
        props.setUserName(name);
        props.setUserID(id);  // The unique ID of the user's Google Account
        localStorage.setItem('id', id);
    }
    
    function logout() {
        googleLogout();
        props.setUserID();
        props.setUserName();
        localStorage.removeItem('id');

        if (props.userID !== undefined) {
            // Update login_expiration_time in DB
            make_api_call(
                `users/login?id=${props.userID}&login_expiration_time=0`,
                "PATCH",
            ); 
        }
    }

    useEffect(() => {
        // Check user already logged in
        let userID = localStorage.getItem("id");
        if (userID !== null && userID !== undefined) {
            // Check if the login has expired
            async function fetchUserData() {
                const data = await make_api_call(`users/logged_in?id=${userID}`); 
                if ("result" in data) {
                    if (data["result"] === true) {
                        login(userID, data["name"]);
                    } else {
                        logout();  // Login expired
                    }
                } else {
                    logout();
                    alert(data);  // Error occurred
                }
            }
            fetchUserData();
        } else {
            logout();
        }
      }, []);

    if (props.userID === undefined) {
        // Login
        return (
            <GoogleLogin
                onSuccess={credentialResponse => {
                    const responsePayload = jwt_decode(credentialResponse.credential);
                    const userID = responsePayload.sub;  // The unique ID of the user's Google Account
                    login(
                        userID,
                        responsePayload.given_name,
                    );

                    // Update login_expiration_time in DB
                    let query_params = (
                        `id=${userID}`
                        + `&first_name=${responsePayload.given_name}`
                        + `&last_name=${responsePayload.family_name}`
                        + `&email=${responsePayload.email}`
                        + `&login_expiration_time=${responsePayload.exp}`
                    );
                    make_api_call(`users/login?${query_params}`, "PATCH"); 
                }}
                onError={(err) => {
                    console.log('Login Failed', err);
                    logout();
                }}
            />
        );
    } else {
        // Logout
        // TODO: CSS like the login button
        return (
            <button onClick={logout}> Logout </button>
        );
    }
}

export default Login;