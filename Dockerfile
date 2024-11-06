FROM node:23.1.0-alpine@sha256:1467ea23cce893347696b155b9e00e7f0ac7d21555eb6f27236f1328212e045e AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY tsconfig.json ./
COPY ./@types ./@types
COPY ./src ./src
RUN yarn build && yarn install --production

FROM node:23.1.0-alpine@sha256:1467ea23cce893347696b155b9e00e7f0ac7d21555eb6f27236f1328212e045e AS final

RUN apk add --no-cache tini

COPY --from=oneagent_codemodules / /
ENV LD_PRELOAD=/opt/dynatrace/oneagent/agent/lib64/liboneagentproc.so

WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist
COPY --chown=node:node docker-entrypoint.sh /docker-entrypoint.sh

ENV NODE_ENV="production"
ENV PORT=3000

EXPOSE $PORT
USER node

ENTRYPOINT ["tini", "--"]
CMD ["/docker-entrypoint.sh"]
