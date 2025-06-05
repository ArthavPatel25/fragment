// src/auth/basic-auth.js

const passport = require('passport');
const { BasicStrategy } = require('passport-http');
const fs = require('fs');
const bcrypt = require('bcrypt');

const users = {};

function loadUsers() {
  const htpasswdPath = process.env.HTPASSWD_FILE || './.htpasswd';
  if (!fs.existsSync(htpasswdPath)) {
    throw new Error(`.htpasswd file not found at ${htpasswdPath}`);
  }

  const lines = fs.readFileSync(htpasswdPath, 'utf-8').split('\n');
  lines.forEach((line) => {
    if (!line.trim()) return;
    const [username, hash] = line.split(':');
    users[username] = hash;
  });
}

loadUsers();

passport.use(
  new BasicStrategy((username, password, done) => {
    if (!users[username]) {
      return done(null, false);
    }
    bcrypt.compare(password, users[username], (err, res) => {
      if (err) return done(err);
      if (!res) return done(null, false);
      return done(null, { id: username });
    });
  })
);

// ✅ Export as a function so `authenticate()` works
module.exports = () => passport.authenticate('basic', { session: false });