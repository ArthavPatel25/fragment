FROM node:lts AS builder

LABEL maintainer="Arthav Patel <acpatel23@myseneca.ca>"
LABEL description="Fragments node.js microservice - Build Stage"

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev --no-fund --no-audit

FROM node:lts-slim

LABEL maintainer="Arthav Patel <acpatel23@myseneca.ca>"
LABEL description="Fragments node.js microservice - Production Stage"

ENV PORT=8080
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY ./src ./src

COPY ./tests/.htpasswd ./tests/.htpasswd

EXPOSE 8080

CMD ["node", "src/server.js"]