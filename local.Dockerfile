FROM node:22.7.0-alpine3.20@sha256:ed9736a13b88ba55cbc08c75c9edac8ae7f72840482e40324670b299336680c1

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn test:dev-evironment-variables && yarn copy-assets && yarn dev
