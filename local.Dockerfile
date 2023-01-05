FROM node:19.3.0-alpine3.16@sha256:88df4b380b0f201056e3be8ec25db87f0fc44324bbe246428fae2fe59290779f

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn copy-assets && yarn dev
