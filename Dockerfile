# This Dockerfile defines the environment and steps required to run the
# fragments microservice in a Docker container.

# 1. Specify the base image
# We start from an official Node.js image. It's best to be specific
# with the version to ensure a consistent environment.
# Run `node --version` on your local machine to find your version
# and use a matching one here (e.g., node:20.11.0, node:18.17.1, etc.).
FROM node:20.17.0

# 2. Add metadata to the image
LABEL maintainer="Arthav Patel <acpatel23@myseneca.ca> "
LABEL description="Fragments node.js microservice"

# 3. Set environment variables for the container
# Default port for the service to run on
ENV PORT=8080
# Reduce the amount of noise from npm during installation
ENV NPM_CONFIG_LOGLEVEL=warn
# Disable colored output in logs, which can be messy in Docker logs
ENV NPM_CONFIG_COLOR=false

# 4. Set the working directory inside the image
# This creates the /app directory and sets all subsequent commands
# (like COPY, RUN, CMD) to be executed from within this directory.
WORKDIR /app

# 5. Copy package.json and package-lock.json
# We copy these first and run `npm install` separately. Because of Docker's
# layer caching, this step will only be re-run if these files change,
# speeding up subsequent builds.
COPY package*.json ./

# 6. Install application dependencies
# This command runs `npm install` inside the container using the
# package files we just copied.
RUN npm install

# 7. Copy the application source code
# Copy the contents of the local `src` directory into a `src`
# directory inside the container (at /app/src).
COPY ./src ./src

# Copy our HTPASSWD file for Basic Auth
COPY ./tests/.htpasswd ./tests/.htpasswd

# 8. Document the port the container listens on
# This is for documentation purposes; it doesn't actually open the port.
EXPOSE 8080

# 9. Specify the command to run when the container starts
# This will execute `npm start` to launch the node.js server.
CMD ["npm", "start"]