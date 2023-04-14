FROM node:18.16.0-alpine3.16@sha256:418340baef60cf1c142e15d8378dcb0e7dd5145956c3a4ebbb0eba551c18a6f7

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn copy-assets && yarn dev
