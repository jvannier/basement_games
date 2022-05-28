function login_has_not_expired(login_expiration_time) {
    // Compare now to expiration date
    let expiration_date = parseInt(
        new Date(login_expiration_time).getTime()
    );
    let now = parseInt(new Date().getTime());
    return Boolean(now < expiration_date);  // Before login expires
}


async function generate_and_store_token(client, req, res) {
    if (req.query.id === undefined) {
        return res.status(200).json({token: ""});
    }

    let token = Math.round(Math.random() * 0xfffff * 1000000).toString(16);
    let query = `
        INSERT INTO users_login_tokens (
            user_id, token, login_expiration_time
        ) VALUES (
            '${req.query.id}',
            '${token}',
            to_timestamp(${req.query.login_expiration_time})
        );
    `
    let err, _ = await client.query(query);
    if (err) {
        return res.status(400).json(err);
    } else {
        return res.status(200).json({token});
    }
}


function delete_token(client, userID, token) {
    // Delete the expired token from the DB
    query = `
        DELETE
        FROM users_login_tokens
        WHERE user_id='${userID}' AND token='${token}';
    `;
    client.query(query);  // fine asynchronous
}


async function delete_expired_tokens(client, userID) {
    // Delete expired tokens for the given user
    let query = `
        SELECT token, login_expiration_time
        FROM users_login_tokens
        WHERE user_id='${userID}';
    `;
    let _, query_result = await client.query(query);

    query_result.rows.map(row => {
        // If the token is expired delete it
        has_not_expired = login_has_not_expired(
            row.login_expiration_time
        );

        if (has_not_expired === false) {
            delete_token(client, userID, row.token);
        }
    });
}


async function is_valid_token (client, userID, token) {
    if (userID === undefined || token === undefined) {
        return false;
    }

    // Check if the given token exists for the given user and if it has expired
    let query = `
        SELECT login_expiration_time
        FROM users_login_tokens
        WHERE user_id='${userID}' AND token='${token}';
    `;
    let err, query_result = await client.query(query);
    if (err) {
        return res.status(400).json(err);
    } else if (query_result.rows.length === 1) {
        let has_not_expired = login_has_not_expired(
            query_result.rows[0].login_expiration_time
        );

        if (has_not_expired === false) {
            delete_token(client, userID, token);
        }

        return has_not_expired;
    } else {
        return false;  // No (user, token) match in DB
    }
}


module.exports = { login_has_not_expired, delete_token, delete_expired_tokens, generate_and_store_token, is_valid_token };