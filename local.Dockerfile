FROM node:16.17.1-alpine@sha256:061d1a13f7107cef701517b906aaeb24e094ff701002e82ff17cabdcfe2e6450

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn copy-assets && yarn dev