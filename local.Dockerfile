FROM node:18.12.1-alpine3.16@sha256:a56bbaddffb19e03fa78d0b2c88cf70ec2f8d40e30048c757fb7c17fd1e12d8d

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn copy-assets && yarn dev
