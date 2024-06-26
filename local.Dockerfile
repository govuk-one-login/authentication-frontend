FROM node:20.2.0-alpine3.16@sha256:f9b54b46639a9017b39eba677cf44c8cb96760ca69dadcc1d4cbd1daea753225

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn test:dev-evironment-variables && yarn copy-assets && yarn dev
