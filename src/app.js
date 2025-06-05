// Load environment variables from .env
require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const routes = require('./routes');


const app = express();



// Logging HTTP requests
app.use(morgan(process.env.LOG_LEVEL || 'dev'));


app.use(express.json());
app.use(express.text({ type: '*/*' }));


app.use(passport.initialize());


app.use('/', routes);

// ========== 404 Not Found Handler ==========
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      code: 404,
      message: 'not found',
    },
  });
});


app.use((err, req, res) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    status: 'error',
    error: {
      code: 500,
      message: 'Internal server error',
    },
  });
});

// Export the app for use in server.js or tests
module.exports = app;