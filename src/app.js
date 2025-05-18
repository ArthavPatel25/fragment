// src/app.js

const express = require('express');
const compression = require('compression');
const passport = require('passport');
const auth = require('./auth'); // add this
const cors = require('cors');


// Create an Express app
const app = express();

app.use(cors({
  origin: 'http://localhost:1234', 
}));
// Use gzip/deflate compression middleware
app.use(compression());

// Initialize passport and use our strategy
passport.use(auth.strategy());
app.use(passport.initialize());

// Define routes
app.use('/', require('./routes'));

module.exports=app;
