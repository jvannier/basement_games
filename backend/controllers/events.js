const router = require('express').Router()
const { detect_sql_injection, run_query } = require("../run_query_util")


module.exports = (client) => {

// TODO: Future: prizing (?) 
// for brett: how much each pack costs? -> LATER / DIFF TABLE?

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
        let query = "SELECT * from events;"
        await run_query(client, query, res);
    });

    router.post('/', async (req, res) => {
        console.log("post to events?")
        console.log(req.query);
        console.log(req.body);
        let err = await detect_sql_injection(req.query, res);
        if (err !== undefined) {
            return;
        }
        // let query = "INSERT INTO events () VALUES ();"
        // await run_query(client, query, res);
    });
    
    router.delete('/', async (req, res) => {
        let err = await detect_sql_injection(req.query, res);
        if (err !== undefined) {
            return;
        }
        // TODO: make sure it's an admin before actually deleting
    })

    return router;
}
