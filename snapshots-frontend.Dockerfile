FROM node:24.15.0-alpine3.22@sha256:b689d4005875ae167178471a7a622ec2909459a3bbb32277260be1971af7a99f AS builder

WORKDIR /app
COPY .npmrc ./
COPY package.json ./
COPY package-lock.json ./
RUN npm config get ignore-scripts | grep -q "true" || exit 1
RUN npm ci --ignore-scripts

COPY tsconfig.json ./
COPY ./@types ./@types
COPY ./src ./src
RUN npm run build && npm ci --ignore-scripts --omit=dev

FROM node:24.15.0-alpine3.22@sha256:b689d4005875ae167178471a7a622ec2909459a3bbb32277260be1971af7a99f AS final

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
