// create-htpasswd.js
const bcrypt = require('bcrypt');
const fs = require('fs');

const username = 'user@example.com';
const password = 'test123';

const saltRounds = 10;
bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;

  const line = `${username}:${hash}\n`;
  fs.writeFileSync('.htpasswd', line);
  console.log('✅ .htpasswd file created successfully.');
});