const router = require('express').Router()
const { detect_sql_injection, run_query } = require("../run_query_util")


module.exports = (client) => {
    router.get('/', async (req, res) => {
        let query = "SELECT * from events;"
        await run_query(client, query, res);
    });

    router.post('/', async (req, res) => {
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
