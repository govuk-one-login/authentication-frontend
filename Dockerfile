FROM node:22.8.0-alpine3.20@sha256:008735b83ef98c7635b5b73cb9b597172fe1895619a8d65378fa7110e427abb5 AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY tsconfig.json ./
COPY ./@types ./@types
COPY ./src ./src
RUN yarn build && yarn install --production

FROM node:22.8.0-alpine3.20@sha256:008735b83ef98c7635b5b73cb9b597172fe1895619a8d65378fa7110e427abb5 AS final

COPY --from=oneagent_codemodules / /
ENV LD_PRELOAD=/opt/dynatrace/oneagent/agent/lib64/liboneagentproc.so

WORKDIR /app
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules/ node_modules
COPY --chown=node:node --from=builder /app/dist/ dist

ENV NODE_ENV="production"
ENV PORT=3000

EXPOSE $PORT
USER node
CMD ["yarn", "start"]
