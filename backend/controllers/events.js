const router = require('express').Router();
const { detect_sql_injection, run_query } = require('../run_query_util');
const { is_valid_logged_in_admin } = require("./util");
const { is_valid_token } = require("./tokens");


module.exports.endpoints = (client) => {    
// TODO: FUTURE: for brett: how much each pack costs? -> LATER / DIFF TABLE? ??? Maybe?

//    junction table of users to events they're signed up for :D and if they've paid for that event

    router.post('/create_events_table', async (req, res) => {
        let query = `
            CREATE TABLE events (
                id SERIAL,
                name VARCHAR(255),
                date TIMESTAMP NOT NULL,
                mtg_set VARCHAR(255),
                max_people int DEFAULT 8,
                entry_cost int,
                event_type VARCHAR(255) DEFAULT 'draft',
                extra_details VARCHAR(255),
                PRIMARY KEY (id)
            );
        `;
        await run_query(client, query, res);
    });

    router.post('/create_users_events_table', async (req, res) => {
        let query = `
            CREATE TABLE users_events (
                user_id VARCHAR(255) NOT NULL,
                signup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                event_id int NOT NULL,

                CONSTRAINT fk_user_id
                    FOREIGN KEY(user_id) 
                    REFERENCES users(google_id),

                CONSTRAINT fk_event_id
                    FOREIGN KEY(event_id) 
                    REFERENCES events(id)
            );
        `;
        await run_query(client, query, res);
    });

    router.get('/', async (req, res) => {
        let query = "SELECT * FROM events;"
        await run_query(client, query, res);
    });

    router.post('/', async (req, res) => {
        let err = await detect_sql_injection(req.query, res);
        if (err !== undefined) {
            return err;
        }
        err = await detect_sql_injection(req.body, res);
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

        let query = `
            INSERT INTO events (
                name, date, mtg_set, max_people,
                entry_cost, event_type, extra_details
            ) VALUES (
                '${req.body.eventName}',
                '${new Date(req.body.eventDateAsInt).toUTCString()}',
                '${req.body.magicSet}',
                '${req.body.maxPeople}',
                '${req.body.entryCost}',
                '${req.body.eventType}',
                '${req.body.extraDetails}'
            );
        `;
        await run_query(client, query, res);
    });
    
    router.delete('/', async (req, res) => {
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

        let query = `
            DELETE
            FROM events
            WHERE id=${req.query.eventID};
        `;
        await run_query(client, query, res);
    })

    router.get('/event_sign_ups', async (req, res) => {
        query = `SELECT user_id, event_id FROM users_events;`;
        await run_query(client, query, res);
    });

    router.post('/join', async (req, res) => {
        let err = await detect_sql_injection(req.query, res);
        if (err !== undefined) {
            return err;
        }

        // Check that token is valid
        const result = await is_valid_token(
            client, req.query.userID, req.query.token,
        );
        if (result !== true) {
            res.status(401).json({
                // Expired or invalid login
                result: "You need to be logged in to join an event.",
            });
        }

        // Check if already signed up for this event (if yes, return 400)
        let query = `
            SELECT user_id, event_id
            FROM users_events
            WHERE
                user_id='${req.query.userID}' AND
                event_id=${req.query.eventID}
            ;
        `;
        err, query_result = await client.query(query);
        if (err) {
            return res.status(400).json(err);
        } else if (query_result.rows.length > 0) {
            return res.status(400).json({
                "error": "User is already signed up for event",
            });
        }

        // Check if event is full (if yes, return 400)
        query = `
            SELECT user_id
            FROM users_events
            WHERE event_id=${req.query.eventID};
        `;
        err, query_result = await client.query(query);
        if (err) {
            return res.status(400).json(err);
        } else {
            signed_up_for_event = query_result.rows.length;
            query = `
                SELECT max_people
                FROM events
                WHERE id=${req.query.eventID};
            `;
            err, query_result = await client.query(query);
            if (err || query_result.rows.length !== 1) {
                return res.status(400).json(err);
            } else if (signed_up_for_event >= query_result.rows[0].max_people) {
                return res.status(400).json({
                    "error": "Event is full",
                });
            }
        }

        // Sign user up for event
        query = `
            INSERT INTO users_events (
                user_id, event_id
            ) VALUES (
                '${req.query.userID}',
                '${req.query.eventID}'
            );
        `;
        await run_query(client, query, res);
    });

    router.post('/leave', async (req, res) => {
        let err = await detect_sql_injection(req.query, res);
        if (err !== undefined) {
            return err;
        }

        // Check that token is valid
        const result = await is_valid_token(
            client, req.query.userID, req.query.token,
        );
        if (result !== true) {
            res.status(401).json({
                // Expired or invalid login
                result: "You need to be logged in to leave an event.",
            });
        }

        // Remove user from event
        query = `
            DELETE FROM users_events 
            WHERE
                user_id='${req.query.userID}' AND
                event_id=${req.query.eventID};
        `;
        await run_query(client, query, res);
    });
    
    return router;
}
