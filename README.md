# Fragment

This project is a Node.js-based Express API server building as part of Lab 1 for the backend microservices course. It includes proper setup for structured logging, linting, formatting, debugging, and testing. Below you'll find everything you need to run, develop, test, and maintain this project.

# Required Tools and Software
Make sure the following are installed and properly configured:

Node.js (LTS version) – to run the server

npm – for managing packages

Git – for version control

VSCode – code editor with extensions:

ESLint

Prettier - Code Formatter

Code Spell Checker

curl – for API testing (use curl.exe in PowerShell)

jq – to pretty-print JSON responses

# Scripts and How to Run Them

▶ Start Server (Production)

npm start

Runs the server normally using:

node src/server.js

▶ Development Mode

npm run dev

Uses nodemon to reload on changes. Includes debug logs.

▶ Debug Mode (VSCode Attach)

npm run debug

Launches the server with inspector at port 9229 for VSCode.

# Lint Code

npm run lint

Fix issues automatically:

npm run lint:fix

# Testing the API

▶ Using curl

curl -i localhost:8080

Expected output:

{
  "status": "ok",
  "author": "Arthav Patel",
  "githubUrl": "https://github.com/ArthavPatel25/fragments",
  "version": "0.0.1"
}

Includes all headers like:

Cache-Control: no-cache

Access-Control-Allow-Origin: *

Content and security headers from helmet middleware

▶ Pretty Print with jq

To format the JSON output of your API using jq, follow these steps:

Start your server:

npm run dev

In a new terminal window, run:

curl -s http://localhost:8080 | jq

This will display the server's JSON response in a readable format.

# Tools and Techniques Used

Node.js – runtime environment

Express – REST API framework

Pino / pino-http – structured logging

stoppable – graceful server shutdown

ESLint – linting and static code analysis

Prettier – automatic code formatting

nodemon – development auto-reloader

cross-env – cross-platform environment variable support

VSCode Debugger – breakpoints and step-through

curl + jq – terminal testing and response formatting

