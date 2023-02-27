FROM node:18.14.2-alpine3.16@sha256:84b677af19caffafe781722d4bf42142ad765ac4233960e18bc526ce036306fe

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn copy-assets && yarn dev
