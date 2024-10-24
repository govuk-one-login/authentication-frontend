FROM node:23.0.0-alpine@sha256:b20f8fad528b0e768936cb88ccb7b0e37cf41587d177e2d6fcdbd48bb4e083ec

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn test:dev-evironment-variables && yarn copy-assets && yarn dev
