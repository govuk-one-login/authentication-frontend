FROM node:24.22.1-alpine3.24@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS builder

WORKDIR /app
COPY .npmrc ./
COPY package.json ./
COPY package-lock.json ./
RUN npm config get ignore-scripts | grep -q "true" || exit 1
RUN --mount=type=secret,id=node_auth_token \
    export NODE_AUTH_TOKEN=$(cat /run/secrets/node_auth_token) && \
    npm ci --ignore-scripts

COPY tsconfig.json ./
COPY ./@types ./@types
COPY ./src ./src
RUN npm run build && npm ci --ignore-scripts --omit=dev

FROM node:24.22.1-alpine3.24@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS final

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
