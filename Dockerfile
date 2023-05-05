FROM node:20.1.0-alpine3.16@sha256:92f5b6d68daf68d08c4def4b8775cee8de9bdeec2fc1cd73d2d235022cd6ef05 as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:20.1.0-alpine3.16@sha256:92f5b6d68daf68d08c4def4b8775cee8de9bdeec2fc1cd73d2d235022cd6ef05 as final
WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]
