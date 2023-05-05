FROM node:20.1.0-alpine3.16@sha256:92f5b6d68daf68d08c4def4b8775cee8de9bdeec2fc1cd73d2d235022cd6ef05

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn copy-assets && yarn dev
