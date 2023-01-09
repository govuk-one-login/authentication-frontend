FROM node:19.4.0-alpine3.16@sha256:4ceb1b89ced8c3f8098ccc26039be8ebf43f102cd7c4f0d76b46a37c61b345e8

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn copy-assets && yarn dev
