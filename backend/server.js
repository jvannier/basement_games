const { Client } = require('pg');
const express = require("express");
const app = express()

app.use(express.json())
app.use(express.static('frontend/build'));
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

// Admin pages to view signed up users and add / edit events

//      events: id, date, mtg set, max people, prizing (?) 
//    junction table of users to events they're signed up for :D and if they've paid for that event

// from talking to brett: create event-> name, 8 slots (players registered), join button, date, (no prizing info? -> or just an extra field brett can type into) -> further details
// entry cost <-. Type (if it's draft or not? draft by default)

// for brett: how much each pack costs? -> LATER / DIFF TABLE?


app.listen(port, () => {});
