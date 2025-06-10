// src/app.js
const express = require('express');
const compression = require('compression');
const passport = require('passport');
const auth = require('./auth'); // add this
const cors = require('cors');
const { createErrorResponse } = require('./response');

// Create an Express app
const app = express();

app.use(cors({
  origin: 'http://localhost:1234', 
}));

app.use(compression());

passport.use(auth.strategy());
app.use(passport.initialize());

// routes
app.use('/', require('./routes'));
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'Not Found'));
});
module.exports = app;
