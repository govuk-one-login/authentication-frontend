FROM node:18.14.1-alpine3.16@sha256:ff8961be4ae0c7f56755be68d6f699f60be7020d63388859fc77b4e86e5d2157 as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:18.14.1-alpine3.16@sha256:ff8961be4ae0c7f56755be68d6f699f60be7020d63388859fc77b4e86e5d2157 as final
WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]
