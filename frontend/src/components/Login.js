import jwt_decode from "jwt-decode";
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import React, { useEffect } from "react";
import { make_api_call } from "../apiUtil";


function Login(props) {
    function logout() {
        if (props.userID !== undefined && props.userID !== null) {
            // Delete login token in DB
            make_api_call(
                `users/logout?userID=${props.userID}&token=${props.token}`,
                "DELETE",
            );
        }

        googleLogout();
        props.setUserID();
        props.setUserName();
        props.setToken();
        localStorage.removeItem('id');
        localStorage.removeItem('token');
    }

    useEffect(() => {
        // Check user already logged in
        if (props.userID !== null && props.userID !== undefined) {
            // Check if the login has expired
            async function fetchUserData() {
                const data = await make_api_call(
                    `users/logged_in?userID=${props.userID}&token=${props.token}`
                );
                if ("result" in data) {
                    if (data["result"] === true) {
                        props.setUserName(data["name"]);
                    } else {
                        logout();  // Login expired
                    }
                } else {
                    logout();
                    alert(JSON.stringify(data));  // Error occurred
                }
            }
            fetchUserData();
        } else {
            logout();
        }
      }, [props.token]);

    if (props.userID === undefined) {
        // Login
        return (
            <GoogleLogin
                onSuccess={credentialResponse => {
                    const responsePayload = jwt_decode(credentialResponse.credential);
                    const userID = responsePayload.sub;  // The unique ID of the user's Google Account
                    props.setUserName(responsePayload.given_name);
                    props.setUserID(userID);  // The unique ID of the user's Google Account
                    localStorage.setItem('id', userID);

                    // Update login_expiration_time in DB
                    let query_params = (
                        `id=${userID}`
                        + `&first_name=${responsePayload.given_name}`
                        + `&last_name=${responsePayload.family_name}`
                        + `&email=${responsePayload.email}`
                        + `&login_expiration_time=${responsePayload.exp}`
                    );
                    make_api_call(`users/login?${query_params}`, "PATCH").then(result => {
                        // Store token in localStorage
                        localStorage.setItem('token', result.token);
                        props.setToken(result.token);
                    });
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