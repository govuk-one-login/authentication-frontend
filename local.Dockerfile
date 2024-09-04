FROM node:22.8.0-alpine3.20@sha256:008735b83ef98c7635b5b73cb9b597172fe1895619a8d65378fa7110e427abb5

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn test:dev-evironment-variables && yarn copy-assets && yarn dev
