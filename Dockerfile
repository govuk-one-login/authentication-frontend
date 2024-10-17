FROM node:23.0.0-alpine@sha256:66fc75e0b8c49a4a0ab647743fde584a5e5ddefc77b7e9113fdc8932a08c323b AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY tsconfig.json ./
COPY ./@types ./@types
COPY ./src ./src
RUN yarn build && yarn install --production

FROM node:23.0.0-alpine@sha256:66fc75e0b8c49a4a0ab647743fde584a5e5ddefc77b7e9113fdc8932a08c323b AS final

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
