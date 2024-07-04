FROM node:22.4.0-alpine3.20@sha256:1e847ddc61d073787aaca688e2a6568d77688b4eae561c806efeb39617caa53f as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:22.4.0-alpine3.20@sha256:1e847ddc61d073787aaca688e2a6568d77688b4eae561c806efeb39617caa53f as final

WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]
