const { is_valid_token } = require("./tokens");


async function is_user_admin(client, userID, res) {
    // Return if the supplied user is an admin
    let query = `
        SELECT is_admin
        FROM users
        WHERE google_id='${userID}';
    `;
    let err, query_result = await client.query(query);
    if (err || query_result.rows.length != 1) {
        return res.status(400).json(err);
    }

    return query_result.rows[0].is_admin;
}


async function is_valid_logged_in_admin(client, userID, token, res) {
    // Check that token is valid and the user is an admin
    let is_valid = await is_valid_token(client, userID, token);
    let is_admin = await is_user_admin(client, userID, res);
    if (is_admin !== true && is_admin !== false) {
        return is_admin;  // Error getting is_admin
    }

    if (is_valid === false || is_admin !== true) {
        return res.status(401).json({
            result: "You're not a logged in admin. D:",  // Expired login
        });
    } else if (is_valid !== true) {
        return is_valid;  // Error occurred
    }
    return true;
}


module.exports = { is_user_admin, is_valid_logged_in_admin };