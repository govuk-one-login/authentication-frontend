FROM node:16.13.0-alpine

ENV NODE_ENV "development"
ENV PORT 3000

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./

RUN yarn clean && yarn install

COPY ./src ./src
COPY ./static ./static
COPY ./@types ./@types

RUN yarn build

EXPOSE $PORT

CMD yarn run start
