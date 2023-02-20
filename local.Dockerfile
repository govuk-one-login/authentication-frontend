FROM node:18.14.1-alpine3.16@sha256:ff8961be4ae0c7f56755be68d6f699f60be7020d63388859fc77b4e86e5d2157

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn copy-assets && yarn dev
