# Stage 1: Build
FROM node:22.12.0-alpine as builder

LABEL maintainer="Arthav Patel <acpatel23@myseneca.ca>"
LABEL description="Fragments node.js microservice"

ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code and htpasswd file
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd

# Stage 2: Run
FROM node:22.12.0-alpine

WORKDIR /app

# Copy built app and node_modules from builder stage
COPY --from=builder /app /app

# Expose port
EXPOSE 8080

# Start the app
CMD ["npm", "start"]