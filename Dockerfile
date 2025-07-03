# Stage 1: Builder
# This stage is responsible for installing all dependencies (including devDependencies)
# and any build-time artifacts. We use a full Node.js image here.
FROM node:20.17.1 AS builder

LABEL maintainer="Arthav Patel <acpatel23@myseneca.ca>"
LABEL description="Fragments node.js microservice - Build Stage"

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
# If these files don't change, this layer and subsequent 'npm install' can be cached.
COPY package*.json ./

# Install all dependencies (production and development).
# Using npm ci ensures exact versions from package-lock.json and a clean install.
# If you don't have a package-lock.json or prefer npm install, that's fine too.
RUN npm ci --omit=dev --no-fund --no-audit

# If you had any build steps (e.g., TypeScript compilation, frontend build), they would go here.
# For a typical Node.js backend, this might not be strictly necessary if all is JS.
# COPY . .
# RUN npm run build # Example: if you had a 'build' script

# Stage 2: Production
# This stage uses a much smaller base image, containing only what's needed for runtime.
# We copy only the production dependencies and source code from the 'builder' stage.
FROM node:20.17.1-slim

LABEL maintainer="Arthav Patel <acpatel23@myseneca.ca>"
LABEL description="Fragments node.js microservice - Production Stage"

# Set environment variables for the container
ENV PORT=8080
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

WORKDIR /app

# Copy *only* the production-ready node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy your application source code.
# Note: Ensure you are copying only what's needed for runtime.
COPY ./src ./src

# Copy the .htpasswd file. Consider if this needs to be in production or if it's only for tests.
# If it's only for tests, it shouldn't be in your final production image.
COPY ./tests/.htpasswd ./tests/.htpasswd

# Document the port the container listens on
EXPOSE 8080

# Specify the command to run when the container starts
CMD ["node", "src/server.js"]