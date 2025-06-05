// src/auth/index.js

const basicAuth = require('./basic-auth');
const cognitoAuth = require('./cognito');

// Choose authentication strategy based on env vars
function authenticate() {
  if (process.env.HTPASSWD_FILE) {
    return basicAuth();
  }

  if (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID) {
    return cognitoAuth();
  }

  throw new Error('No valid authentication strategy configured');
}

module.exports = { authenticate };