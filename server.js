const { Client } = require('pg');
const express = require("express");
const app = express()
app.use(express.json())
app.use(express.static('frontend/build'));
app.use(express.urlencoded({ extended: false }))

const port = process.env.PORT || 3001;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();


// ROOT
app.get('/users/', async (req, res) => {
    let err, query_result = await client.query('SELECT * FROM testing;')
    console.log(err, query_result)
    let response = []
    for (let row of query_result.rows) {
        response.push(JSON.stringify(row))
    }
    res.status(200).json({
        message: JSON.stringify(response)
    })
})
app.listen(port, () => {});
