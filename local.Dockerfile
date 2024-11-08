FROM node:20.17.0-alpine@sha256:2d07db07a2df6830718ae2a47db6fedce6745f5bcd174c398f2acdda90a11c03

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn test:dev-evironment-variables && yarn copy-assets && yarn dev
