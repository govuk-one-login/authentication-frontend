FROM node:18.14.0-alpine3.16@sha256:a1eb2d65f10c37ed4956fc2faa6d1b86ec1fe8fc77d01b1fd4174488cf923c8c

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn copy-assets && yarn dev
