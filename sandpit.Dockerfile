FROM node:22.3.0-alpine3.20@sha256:415f3219943ef82fa45988acdaa7df05a0b52cabd3502095c59d34cbe28c1bc1 as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:22.3.0-alpine3.20@sha256:415f3219943ef82fa45988acdaa7df05a0b52cabd3502095c59d34cbe28c1bc1 as final

WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]
