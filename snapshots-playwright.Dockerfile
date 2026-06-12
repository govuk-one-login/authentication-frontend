FROM node:24.15.0-alpine3.22@sha256:b689d4005875ae167178471a7a622ec2909459a3bbb32277260be1971af7a99f AS builder

WORKDIR /app
COPY .npmrc ./
COPY ./package.json ./package-lock.json  ./
COPY ./src ./src
RUN npm config get ignore-scripts | grep -q "true" || exit 1
RUN npm ci --ignore-scripts


FROM mcr.microsoft.com/playwright:v1.59.1-noble@sha256:eac9b0a5312cdab40ee8c2429df5bf19bffdccf8f3bf3c42268e173f97541645 AS playwright

WORKDIR /app

COPY /playwright.config.ts ./
COPY --from=builder /app/node_modules ./node_modules
RUN chown -R pwuser:pwuser /app

USER pwuser
