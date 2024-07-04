FROM node:22.4.0-alpine3.20@sha256:1e847ddc61d073787aaca688e2a6568d77688b4eae561c806efeb39617caa53f

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn test:dev-evironment-variables && yarn copy-assets && yarn dev
