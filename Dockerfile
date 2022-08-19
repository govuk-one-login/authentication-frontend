FROM node:16.17.0-alpine@sha256:3c7ed283086d6b65c129ca9b1312f56dfbf843aeb4384a491f2040f4b6232652 as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:16.17.0-alpine@sha256:3c7ed283086d6b65c129ca9b1312f56dfbf843aeb4384a491f2040f4b6232652 as final
WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]