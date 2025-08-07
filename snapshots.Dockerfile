FROM node:20.17.0-alpine@sha256:2d07db07a2df6830718ae2a47db6fedce6745f5bcd174c398f2acdda90a11c03 AS builder

WORKDIR /app

COPY ./package.json ./yarn.lock  ./
COPY ./src ./src
RUN yarn install


FROM mcr.microsoft.com/playwright:v1.54.1-jammy AS playwright

WORKDIR /app

#ENV NODE_ENV "development"
#ENV PORT 3000
#
#VOLUME ["/app"]
COPY /playwright.config.ts ./
COPY --from=builder app/node_modules ./node_modules
COPY --from=builder app/src ./src

#COPY src/components/contact-us/tests/contact-us-snapshot.test.ts-snapshots ./contact-us-snapshot.test.ts-snapshots
#COPY src/components/contact-us/tests/contact-us-snapshot.test.ts ./contact-us-snapshot.test.ts
#COPY test-results ./test-results


#CMD ["npx", "playwright", "test"]