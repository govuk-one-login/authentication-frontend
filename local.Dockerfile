FROM node:18.15.0-alpine3.16@sha256:3e3eb5001e563ae447fdb02b1eddf071558828feffc7f49431ed8658621972c8

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn copy-assets && yarn dev
