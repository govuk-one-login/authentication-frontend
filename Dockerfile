FROM node:18.14.0-alpine3.16@sha256:a1eb2d65f10c37ed4956fc2faa6d1b86ec1fe8fc77d01b1fd4174488cf923c8c as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:18.14.0-alpine3.16@sha256:a1eb2d65f10c37ed4956fc2faa6d1b86ec1fe8fc77d01b1fd4174488cf923c8c as final
WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]
