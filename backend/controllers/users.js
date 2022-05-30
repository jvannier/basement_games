const router = require('express').Router()
const { detect_sql_injection, run_query } = require("../run_query_util")
const { delete_expired_tokens, generate_and_store_token, delete_token, is_valid_token } = require("./tokens");
const { is_user_admin, is_valid_logged_in_admin } = require("./util");


module.exports.endpoints = (client) => {
    router.post('/create_users_table', async (req, res) => {
        let query = `
            CREATE TABLE users (
                google_id VARCHAR(255) NOT NULL UNIQUE,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                email VARCHAR(255),
                is_admin BOOLEAN DEFAULT 'f',
                account_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (google_id)
            );
        `;
        await run_query(client, query, res);
    });
    
    router.post('/create_users_token_table', async (req, res) => {
        let query = `
            CREATE TABLE users_login_tokens (
                user_id VARCHAR(255) NOT NULL,
                token VARCHAR(255) NOT NULL UNIQUE,
                login_expiration_time TIMESTAMP NOT NULL,

                CONSTRAINT fk_user_id
                    FOREIGN KEY(user_id) 
                    REFERENCES users(google_id)
            );
        `;
        await run_query(client, query, res);
    })

    router.get('/', async (req, res) => {
        let err = await detect_sql_injection(req.query, res);
        if (err !== undefined) {
            return err;
        }

        // Check that token is valid and the user is an admin
        const result = await is_valid_logged_in_admin(
            client, req.query.userID, req.query.token, res,
        );
        if (result !== true) {
            return result;
        }

        let query = `SELECT * FROM users;`;
        await run_query(client, query, res);
    });

    router.get('/names', async (req, res) => {
        // Get ids to user names
        let query = `SELECT google_id, first_name, last_name FROM users;`;
        await run_query(client, query, res);
    });

    router.patch('/login', async (req, res) => {
        // Create user if does not exist, otherwise update last_login.
        //  Also create and store login token and login_expiration_time.
        let err = await detect_sql_injection(req.query, res);
        if (err !== undefined) {
            return err;
        }

        // Create user if it does not exist, otherwise update last_login
        let query = `
            INSERT INTO users (
                google_id, first_name, last_name, email
            ) VALUES (
                '${req.query.id}',
                '${req.query.first_name}',
                '${req.query.last_name}',
                '${req.query.email}'
            ) ON CONFLICT (google_id) DO UPDATE SET
                last_login = to_timestamp(${Math.floor(new Date().getTime() / 1000)});
        `;
        err, query_result = await client.query(query);
        if (err) {
            return res.status(400).json(err);
        }

        // No error, store token in the users_login_tokens table and return it
        generate_and_store_token(client, req, res);
    });

    router.delete('/logout', async (req, res) => {
        // Delete login token for user
        let err = await detect_sql_injection(req.query, res);
        if (err !== undefined) {
            return err;
        }

        delete_token(client, req.query.userID, req.query.token);
        return res.status(200);
    });

    router.get('/logged_in', async (req, res) => {
        let err = await detect_sql_injection(req.query, res);
        if (err !== undefined) {
            return err;
        }

        // Check that token is valid
        let result = await is_valid_token(client, req.query.userID, req.query.token);
        if (result === false) {
            return res.status(200).json({
                result: false,  // Expired login
            });
        } else if (result !== true) {
            return result;  // Error occurred
        }

        // Return name off the user if they're logged in
        let query_result;
        let query = `SELECT first_name FROM users WHERE google_id='${req.query.userID}';`;
        err, query_result = await client.query(query);
        if (err || query_result.rows.length != 1) {
            return res.status(400).json(err);
        }

        // Lookup all tokens for this user and delete expired ones
        await delete_expired_tokens(client, req.query.userID);

        res.status(200).json({
            name: query_result.rows[0].first_name,
            result: true,
        });
    });

    router.get('/is_admin', async(req, res) => {
        // Return if the supplied user is an admin and the login hasn't expired
        let err = await detect_sql_injection(req.query, res);
        if (err !== undefined) {
            return err;
        }

        // Check that token is valid
        let logged_in = await is_valid_token(client, req.query.userID, req.query.token);
        if (logged_in === false) {
            return res.status(200).json({
                is_admin: false,
                logged_in: false,
            });
        } else if (logged_in !== true) {
            return logged_in;  // Error occurred
        }

        let is_admin = await is_user_admin(client, req.query.userID, res);
        res.status(200).json({is_admin, logged_in});
    });

    return router;
}
