FROM node:19.6.0-alpine3.16@sha256:1fd6846cfed166b9347218b9f3d6ac7cc6ea27ba7b9a2ba288446577de00c29f as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:19.6.0-alpine3.16@sha256:1fd6846cfed166b9347218b9f3d6ac7cc6ea27ba7b9a2ba288446577de00c29f as final
WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]
