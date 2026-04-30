FROM node:24.15.0-alpine3.22@sha256:b689d4005875ae167178471a7a622ec2909459a3bbb32277260be1971af7a99f

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

RUN npm config get ignore-scripts | grep -q "true" || exit 1
CMD npm ci --ignore-scripts && npm run test:dev-evironment-variables && npm run copy-assets && npm run dev
