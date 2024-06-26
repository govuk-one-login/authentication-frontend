FROM node:18.20.3-alpine3.20@sha256:e37da457874383fa9217067867ec85fe8fe59f0bfa351ec9752a95438680056e

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn test:dev-evironment-variables && yarn copy-assets && yarn dev
