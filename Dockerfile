FROM node:22.9.0-alpine@sha256:c9bb43423a6229aeddf3d16ae6aaa0ff71a0b2951ce18ec8fedb6f5d766cf286 AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY tsconfig.json ./
COPY ./@types ./@types
COPY ./src ./src
RUN yarn build && yarn install --production

FROM node:22.9.0-alpine@sha256:c9bb43423a6229aeddf3d16ae6aaa0ff71a0b2951ce18ec8fedb6f5d766cf286 AS final

COPY --from=oneagent_codemodules / /
ENV LD_PRELOAD=/opt/dynatrace/oneagent/agent/lib64/liboneagentproc.so

WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV="production"
ENV PORT=3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]
