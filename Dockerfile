# In general changes should be synced with `sandpit.Dockerfile` (excluding the Dynatrace layer)
FROM node:20.17.0-alpine@sha256:2d07db07a2df6830718ae2a47db6fedce6745f5bcd174c398f2acdda90a11c03 AS builder

WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install

COPY tsconfig.json ./
COPY ./@types ./@types
COPY ./src ./src
RUN yarn build && yarn install --production

FROM node:20.17.0-alpine@sha256:2d07db07a2df6830718ae2a47db6fedce6745f5bcd174c398f2acdda90a11c03 AS journey_map_builder

WORKDIR /app/journey-map
COPY journey-map/package.json ./
COPY journey-map/package-lock.json ./
COPY --from=builder app/src ../src
COPY --from=builder app/node_modules ../node_modules
RUN npm ci

COPY journey-map/src ./src
COPY journey-map/public ./public
RUN npm run build

FROM node:20.17.0-alpine@sha256:2d07db07a2df6830718ae2a47db6fedce6745f5bcd174c398f2acdda90a11c03 AS final

RUN apk add --no-cache tini

COPY --from=oneagent_codemodules / /
ENV LD_PRELOAD=/opt/dynatrace/oneagent/agent/lib64/liboneagentproc.so

WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist
COPY --chown=node:node --from=journey_map_builder /app/journey-map/public journey-map/public
COPY --chown=node:node docker-entrypoint.sh /docker-entrypoint.sh

ENV NODE_ENV="production"
ENV PORT=3000

EXPOSE $PORT
USER node

ENTRYPOINT ["tini", "--"]
CMD ["/docker-entrypoint.sh"]
