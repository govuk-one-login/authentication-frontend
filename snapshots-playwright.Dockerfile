FROM node:24.22.1-alpine3.24@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS builder

WORKDIR /app
COPY .npmrc ./
COPY ./package.json ./package-lock.json  ./
COPY ./src ./src
RUN npm config get ignore-scripts | grep -q "true" || exit 1
RUN --mount=type=secret,id=node_auth_token \
    export NODE_AUTH_TOKEN=$(cat /run/secrets/node_auth_token) && \
    npm ci --ignore-scripts

FROM mcr.microsoft.com/playwright:v1.59.1-noble@sha256:eac9b0a5312cdab40ee8c2429df5bf19bffdccf8f3bf3c42268e173f97541645 AS playwright

WORKDIR /app
RUN chown -R pwuser:pwuser /app

USER pwuser

COPY /playwright.config.ts ./
COPY --from=builder /app/node_modules ./node_modules
