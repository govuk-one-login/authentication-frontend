FROM node:22.5.1-alpine3.20@sha256:c06bea602e410a3321622c7782eb35b0afb7899d9e28300937ebf2e521902555

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn test:dev-evironment-variables && yarn copy-assets && yarn dev
