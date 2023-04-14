FROM node:18.16.0-alpine3.16@sha256:418340baef60cf1c142e15d8378dcb0e7dd5145956c3a4ebbb0eba551c18a6f7 as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:18.16.0-alpine3.16@sha256:418340baef60cf1c142e15d8378dcb0e7dd5145956c3a4ebbb0eba551c18a6f7 as final
WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]
