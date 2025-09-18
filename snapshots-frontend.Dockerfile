FROM node:20.17.0-alpine@sha256:2d07db07a2df6830718ae2a47db6fedce6745f5bcd174c398f2acdda90a11c03 AS builder

WORKDIR /app
COPY .npmrc ./
COPY package.json ./
COPY package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY ./@types ./@types
COPY ./src ./src
RUN npm run build && npm ci --omit=dev

FROM node:20.17.0-alpine@sha256:2d07db07a2df6830718ae2a47db6fedce6745f5bcd174c398f2acdda90a11c03 AS final

RUN apk add --no-cache tini

WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist
COPY --chown=node:node docker-entrypoint.sh /docker-entrypoint.sh

ENV PORT=3000

EXPOSE $PORT
USER node

ENTRYPOINT ["tini", "--"]
CMD ["/docker-entrypoint.sh"]
