FROM node:16.18.0-alpine@sha256:816bcb8b3daea8b186af310591d558e48c370615d4cc0da2b8ec4d085537372c

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn copy-assets && yarn dev