const router = require('express').Router();
const { detect_sql_injection, run_query } = require('../run_query_util');
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

        // Make sure logged in admin
        const is_valid = await is_valid_token(req.query.userID, req.query.token);
        if (is_valid !== true) {
            res.status(400);
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

        // Make sure logged in admin
        const is_valid = await is_valid_token(req.query.userID, req.query.token);
        if (is_valid !== true) {
            res.status(400);
        } 

        let query = `
            DELETE
            FROM events
            WHERE id=${req.query.eventID}
        `;
        await run_query(client, query, res);
    })

    return router;
}
