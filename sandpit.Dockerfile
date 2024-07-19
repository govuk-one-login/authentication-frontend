FROM node:22.5.0-alpine3.20@sha256:f200d5ce9f0c43df6f3a6b97b692f998cce270f1409864de5fbb2e61836121f2 as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:22.5.0-alpine3.20@sha256:f200d5ce9f0c43df6f3a6b97b692f998cce270f1409864de5fbb2e61836121f2 as final

WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]
