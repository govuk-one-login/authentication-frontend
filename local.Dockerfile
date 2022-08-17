FROM node:16.17.0-alpine@sha256:3c7ed283086d6b65c129ca9b1312f56dfbf843aeb4384a491f2040f4b6232652

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn copy-assets && yarn dev