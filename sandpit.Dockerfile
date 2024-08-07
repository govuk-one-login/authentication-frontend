FROM node:22.6.0-alpine3.20@sha256:4162c8a0f1fef9d3b003eb1fd3d8a26db46815288832aa453d829f4129d4dfd3 as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:22.6.0-alpine3.20@sha256:4162c8a0f1fef9d3b003eb1fd3d8a26db46815288832aa453d829f4129d4dfd3 as final

WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]
