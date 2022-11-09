FROM node:19.0.1-alpine@sha256:00c5c0850a48bbbf0136f1c886bad52784f9816a8d314a99307d734598359ed4

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn copy-assets && yarn dev