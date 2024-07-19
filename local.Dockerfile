FROM node:22.5.0-alpine3.20@sha256:f200d5ce9f0c43df6f3a6b97b692f998cce270f1409864de5fbb2e61836121f2

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn test:dev-evironment-variables && yarn copy-assets && yarn dev
