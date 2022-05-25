const router = require('express').Router()
const { detect_sql_injection, run_query } = require("../run_query_util")


module.exports = (client) => {
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
                login_expiration_time TIMESTAMP NOT NULL,
                PRIMARY KEY (google_id)
            );
        `;
        await run_query(client, query, res);
    });

    router.get('/', async (req, res) => {
        let query = `
            SELECT
                google_id,
                first_name,
                last_name,
                email,
                is_admin,
                account_created,
                last_login
            FROM users;
        `;
        await run_query(client, query, res);
    });

    router.patch('/login', async (req, res) => {
        // Create user if does not exist, otherwise update last_login
        //  and login_expiration_time.
        let err = await detect_sql_injection(req.query, res);
        if (err !== undefined) {
            return;
        }

        let query = `
            INSERT INTO users (google_id, first_name, last_name, email, login_expiration_time) 
            VALUES (
                '${req.query.id}',
                '${req.query.first_name}',
                '${req.query.last_name}',
                '${req.query.email}',
                to_timestamp(${req.query.login_expiration_time})
            ) ON CONFLICT (google_id) DO UPDATE SET
                last_login = to_timestamp(${Math.floor(new Date().getTime() / 1000)}),
                login_expiration_time = to_timestamp(${req.query.login_expiration_time});
        `;
        console.log(query);
        await run_query(client, query, res);
    });

    function login_has_not_expired (login_expiration_time) {
        // Compare now to expiration date
        let expiration_date = parseInt(
            new Date(login_expiration_time).getTime()
        );
        let now = parseInt(new Date().getTime());
        return Boolean(now < expiration_date);  // Before login expires
    }

    router.get('/logged_in', async (req, res) => {
        let err = await detect_sql_injection(req.query, res);
        if (err !== undefined) {
            return;
        }

        // Return if the user is logged in
        let query_result;
        let query = `SELECT first_name, login_expiration_time FROM users WHERE google_id='${req.query.id}';`;
        err, query_result = await client.query(query);
        if (err || query_result.rows.length != 1) {
            return res.status(400).json(err);
        }

        res.status(200).json({
            name: query_result.rows[0].first_name,
            result: login_has_not_expired(query_result.rows[0].login_expiration_time),
        });
    });

    router.get('/is_admin', async(req, res) => {
        let err = await detect_sql_injection(req.query, res);
        if (err !== undefined) {
            return;
        }

        // Return if the supplied user is an admin and the login hasn't expired
        let query = `
            SELECT is_admin, login_expiration_time
            FROM users
            WHERE google_id='${req.query.id}';
        `;
        err, query_result = await client.query(query);
        if (err || query_result.rows.length != 1) {
            return res.status(400).json(err);
        }

        res.status(200).json({
            is_admin: query_result.rows[0].is_admin,
            logged_in: login_has_not_expired(query_result.rows[0].login_expiration_time),
        });
    });

    return router;
}
