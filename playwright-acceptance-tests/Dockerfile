FROM mcr.microsoft.com/playwright:v1.59.1-noble@sha256:eac9b0a5312cdab40ee8c2429df5bf19bffdccf8f3bf3c42268e173f97541645

WORKDIR /app
RUN chown -R pwuser:pwuser /app

USER pwuser

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY --chown=pwuser:pwuser . .

CMD ["npm", "test"]
