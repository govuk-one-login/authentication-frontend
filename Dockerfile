FROM node:18.15.0-alpine3.16@sha256:3e3eb5001e563ae447fdb02b1eddf071558828feffc7f49431ed8658621972c8 as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:18.15.0-alpine3.16@sha256:3e3eb5001e563ae447fdb02b1eddf071558828feffc7f49431ed8658621972c8 as final
WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]
