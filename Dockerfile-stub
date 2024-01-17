FROM node:18.12.1-alpine3.16@sha256:67373bd5d90ea600cb5f0fa58d7a5a4e6ebf50b6e05c50c1d1cc22df5134db43

ENV NODE_ENV "development"
ENV PORT 2000

USER node
WORKDIR /home/node/app
COPY --chown=node:node . .

RUN yarn install

EXPOSE $PORT

CMD ["yarn", "dummy-server"]
