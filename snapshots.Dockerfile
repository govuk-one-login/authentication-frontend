FROM mcr.microsoft.com/playwright:v1.50.1-jammy AS playwright

ENV NODE_ENV "development"
ENV PORT 3000

VOLUME ["/app"]
WORKDIR /app

EXPOSE $PORT

CMD yarn install && yarn test:dev-evironment-variables && yarn copy-assets && yarn dev
CMD npx playwright test