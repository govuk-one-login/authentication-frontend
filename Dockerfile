FROM node:16.18.0-alpine@sha256:816bcb8b3daea8b186af310591d558e48c370615d4cc0da2b8ec4d085537372c as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:16.18.0-alpine@sha256:816bcb8b3daea8b186af310591d558e48c370615d4cc0da2b8ec4d085537372c as final
WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]