FROM node:19.3.0-alpine3.16@sha256:88df4b380b0f201056e3be8ec25db87f0fc44324bbe246428fae2fe59290779f as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:19.3.0-alpine3.16@sha256:88df4b380b0f201056e3be8ec25db87f0fc44324bbe246428fae2fe59290779f as final
WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]
