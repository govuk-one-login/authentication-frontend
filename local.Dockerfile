FROM node:19.6.0-alpine3.16@sha256:1fd6846cfed166b9347218b9f3d6ac7cc6ea27ba7b9a2ba288446577de00c29f

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn copy-assets && yarn dev
