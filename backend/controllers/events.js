const router = require('express').Router();
const { detect_sql_injection, escape_args, run_query, unescape_arg } = require('../run_query_util');
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
        let query = "SELECT * FROM events ORDER BY date ASC;"
        let err, query_result = await client.query(query);
        if (err) {
            return res.status(400).json(err);
        } else {
            let result = query_result.rows.map(event => {
                event['extra_details'] = unescape_arg(event['extra_details']);
                return event;
            });
            return res.status(200).json(result);
        }
    });

    router.post('/', async (req, res) => {
        let err = await detect_sql_injection(req.query, res);
        if (err !== undefined) {
            return err;
        }
        req.body.eventDate = new Date(req.body.eventDateAsInt).toUTCString()
        req.body = escape_args(req.body);

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
                ${req.body.eventName},
                ${req.body.eventDate},
                ${req.body.magicSet},
                ${req.body.maxPeople},
                ${req.body.entryCost},
                ${req.body.eventType},
                ${req.body.extraDetails}
            );
        `;
        await run_query(client, query, res);
    });

    router.patch('/', async (req, res) => {
        let err = await detect_sql_injection(req.query, res);
        if (err !== undefined) {
            return err;
        }
        req.body.eventDate = new Date(req.body.eventDateAsInt).toUTCString()
        req.body = await escape_args(req.body);

        // Check that token is valid and the user is an admin
        const result = await is_valid_logged_in_admin(
            client, req.query.userID, req.query.token, res,
        );
        if (result !== true) {
            return result;
        }

        let query = `
            UPDATE events SET
                name=${req.body.eventName},
                date=${req.body.eventDate},
                mtg_set=${req.body.magicSet},
                max_people=${req.body.maxPeople},
                entry_cost=${req.body.entryCost},
                event_type=${req.body.eventType},
                extra_details=${req.body.extraDetails}
            WHERE id=${req.body.eventID};
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

        // Delete from signups for event from users_events
        let query = `
            DELETE
            FROM users_events
            WHERE event_id=${req.query.eventID};
        `;
        err, _ = await client.query(query);
        if (err) {
            return res.status(400).json(err);
        }

        query = `
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

    router.get('/event_sign_ups/:eventID', async (req, res) => {
        let err = await detect_sql_injection(req.params, res);
        if (err !== undefined) {
            return err;
        }

        query = `SELECT user_id, event_id FROM users_events WHERE event_id='${req.params.eventID}';`;
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


    router.post('/join_bulk', async (req, res) => {
        let err = await detect_sql_injection(req.query, res);
        if (err !== undefined) {
            return err;
        }
        let players = JSON.parse(req.body.players);
        err = await detect_sql_injection(players, res);
        if (err !== undefined) {
            return err;
        }
        err = await detect_sql_injection(req.body.eventID, res);
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

        // Get list of users in the given event
        let query = `
            SELECT user_id
            FROM users_events
            WHERE
                event_id=${req.body.eventID}
            ;
        `;
        err, query_result = await client.query(query);
        if (err) {
            return res.status(400).json(err);
        }
        let signed_up = query_result.rows.map(row => row.user_id);
        for (let index = 0; index < players.length; index++) {
            let player = players[index];
            if (!signed_up.includes(player)) {
                // Sign user up for event
                query = `
                    INSERT INTO users_events (
                        user_id, event_id
                    ) VALUES (
                        '${player}',
                        '${req.body.eventID}'
                    );
                `;
                err, query_result = await client.query(query);
                if (err) {
                    return res.status(400).json(err);
                }
            }
            // Show we counted it by removing it from signed_up
            signed_up.splice(signed_up.indexOf(player), 1);
        }

        // If there is anyone left in signed_up, remove those players
        for (let index = 0; index < signed_up.length; index++) {
            let player = signed_up[index];
            // TODO
            query = `
                DELETE FROM users_events
                WHERE
                    user_id='${player}' AND
                    event_id='${req.body.eventID}'
                ;
            `;
            err, query_result = await client.query(query);
            if (err) {
                return res.status(400).json(err);
            }
        };

        // TODO: Check if event is over full........
        return res.status(200);
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
