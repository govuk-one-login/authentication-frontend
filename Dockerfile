FROM node:19.5.0-alpine3.16@sha256:f69f0ebb6343f4559f68747bdd113f6685fb2f19a4c978cdd467b334a05b3203 as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:19.5.0-alpine3.16@sha256:f69f0ebb6343f4559f68747bdd113f6685fb2f19a4c978cdd467b334a05b3203 as final
WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]
