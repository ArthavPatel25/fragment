# Stage 1: Builder
FROM node:lts AS builder

LABEL maintainer="Arthav Patel <acpatel23@myseneca.ca>"
LABEL description="Fragments node.js microservice - Build Stage"

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install all dependencies (production and development).
RUN npm ci --omit=dev --no-fund --no-audit

# Copy the entire source code for the build stage.
# This ensures that any build-time artifacts (even if not explicitly used)
# or internal paths that might resolve to source files during build
# are available.
COPY . .

# Stage 2: Production
FROM node:lts-slim

LABEL maintainer="Arthav Patel <acpatel23@myseneca.ca>"
LABEL description="Fragments node.js microservice - Production Stage"

ENV PORT=8080
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

WORKDIR /app

# Copy *only* the production-ready node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# COPY package.json to the production stage, as some applications
# might read it at runtime (e.g., for version info or app name).
COPY package*.json ./
# Copy your application source code.
COPY ./src ./src

# Copy the .htpasswd file.
COPY ./tests/.htpasswd ./tests/.htpasswd

EXPOSE 8080

CMD ["node", "src/server.js"]