const { Client } = require('pg');
const express = require("express");
const app = express()

app.use(express.json())
app.use('/', express.static('frontend/build'));
app.use(express.urlencoded({ extended: false }))

const port = process.env.PORT || 3000;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();

// Endpoints
const usersController = require('./controllers/users').endpoints(client)
app.use('/users/', usersController)

const eventsController = require('./controllers/events').endpoints(client)
app.use('/events/', eventsController)

// TODO: junction table of users to events they're signed up for :D and if they've paid for that event


app.listen(port, () => {});
