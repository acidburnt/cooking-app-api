require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');

// setting up the port
const port = process.env.PORT;

const app = express();
app.use(bodyParser.json());

// Routes for Recipes
require('./routes/recipe')(app);

// Routes for Users
require('./routes/user')(app);

app.listen(port, () => {
  console.log(`Started up on port ${port}.`);
});

module.exports = { app };
