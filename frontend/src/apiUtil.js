import { API_URL } from "./consts";


const make_api_call = async (endpoint, method = "GET", data = {}) => {
    try {
        let options = {
            mode: "same-site",
            method: method,
            referrer: "strict-origin-when-cross-origin",
        };
        if (method === "POST" || method === "PATCH") {
            options["headers"] = {
                'Content-Type': 'application/json',
            };
            options["body"] = JSON.stringify(data);
        }
        const response = await fetch(
            `${API_URL}/${endpoint}`, options,
        );
        return await response.json();
    } catch (SyntaxError) {
        return {
            "error": "Unkown error. Server may be down.",
        }
    }
}

const is_logged_in_admin = async (userID, token) => {
    if (userID === undefined || userID === null) {
        return false;
    }

    const data = await make_api_call(`users/is_admin/?userID=${userID}&token=${token}`)
    // if not logged or not an admin, then return false
    return Boolean(data.is_admin && data.logged_in);
}

export { make_api_call, is_logged_in_admin };