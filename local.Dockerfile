FROM node:24.22.1-alpine3.24@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

RUN npm config get ignore-scripts | grep -q "true" || exit 1
CMD npm ci --ignore-scripts && npm run test:dev-evironment-variables && npm run copy-assets && npm run dev
