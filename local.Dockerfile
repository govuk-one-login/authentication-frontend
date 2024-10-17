FROM node:23.0.0-alpine@sha256:66fc75e0b8c49a4a0ab647743fde584a5e5ddefc77b7e9113fdc8932a08c323b

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn test:dev-evironment-variables && yarn copy-assets && yarn dev
