FROM node:18.20.3-alpine3.20@sha256:e37da457874383fa9217067867ec85fe8fe59f0bfa351ec9752a95438680056e as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./@types ./@types
RUN yarn install && yarn build && yarn clean-modules && yarn install --production=true

FROM node:18.20.3-alpine3.20@sha256:e37da457874383fa9217067867ec85fe8fe59f0bfa351ec9752a95438680056e as final

WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]
