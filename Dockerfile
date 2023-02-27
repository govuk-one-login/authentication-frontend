FROM node:18.14.2-alpine3.16@sha256:84b677af19caffafe781722d4bf42142ad765ac4233960e18bc526ce036306fe as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:18.14.2-alpine3.16@sha256:84b677af19caffafe781722d4bf42142ad765ac4233960e18bc526ce036306fe as final
WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]
