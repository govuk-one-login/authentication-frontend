FROM node:23.0.0-alpine@sha256:66fc75e0b8c49a4a0ab647743fde584a5e5ddefc77b7e9113fdc8932a08c323b as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:23.0.0-alpine@sha256:66fc75e0b8c49a4a0ab647743fde584a5e5ddefc77b7e9113fdc8932a08c323b as final

WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]
