FROM node:16.17.1-alpine@sha256:061d1a13f7107cef701517b906aaeb24e094ff701002e82ff17cabdcfe2e6450 as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:16.17.1-alpine@sha256:061d1a13f7107cef701517b906aaeb24e094ff701002e82ff17cabdcfe2e6450 as final
WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]