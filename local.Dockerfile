FROM node:19.5.0-alpine3.16@sha256:f69f0ebb6343f4559f68747bdd113f6685fb2f19a4c978cdd467b334a05b3203

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn copy-assets && yarn dev
