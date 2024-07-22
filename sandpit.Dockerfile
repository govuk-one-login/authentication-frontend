FROM node:22.5.1-alpine3.20@sha256:c06bea602e410a3321622c7782eb35b0afb7899d9e28300937ebf2e521902555 as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:22.5.1-alpine3.20@sha256:c06bea602e410a3321622c7782eb35b0afb7899d9e28300937ebf2e521902555 as final

WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]
