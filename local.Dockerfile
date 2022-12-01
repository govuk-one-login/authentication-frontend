FROM node:19.2.0-alpine@sha256:80844b6643f239c87fceae51e6540eeb054fc7114d979703770ec75250dcd03b

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn copy-assets && yarn dev