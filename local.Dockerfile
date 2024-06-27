FROM node:22.3.0-alpine3.20@sha256:415f3219943ef82fa45988acdaa7df05a0b52cabd3502095c59d34cbe28c1bc1

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn test:dev-evironment-variables && yarn copy-assets && yarn dev
