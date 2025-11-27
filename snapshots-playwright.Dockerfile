FROM node:20.17.0-alpine@sha256:2d07db07a2df6830718ae2a47db6fedce6745f5bcd174c398f2acdda90a11c03 AS builder

WORKDIR /app
COPY .npmrc ./
COPY ./package.json ./package-lock.json  ./
COPY ./src ./src
RUN npm ci


FROM mcr.microsoft.com/playwright:v1.56.1-noble AS playwright

WORKDIR /app

COPY /playwright.config.ts ./
COPY --from=builder /app/node_modules ./node_modules
