FROM node:19.2.0-alpine3.16@sha256:80844b6643f239c87fceae51e6540eeb054fc7114d979703770ec75250dcd03b as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:19.2.0-alpine3.16@sha256:80844b6643f239c87fceae51e6540eeb054fc7114d979703770ec75250dcd03b as final
WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]