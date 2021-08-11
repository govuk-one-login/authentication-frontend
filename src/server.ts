import http from "http";
import { createApp } from "./app";
import { logger } from "./utils/logger";

const app = createApp();
const port: number | string = process.env.PORT || 3000;

const server = http.createServer(app);

server
  .listen(port, () => {
    logger.info(`Server listening on port ${port}`);
    app.emit("appStarted");
  })
  .on("error", (error: Error) => {
    logger.error(`Unable to start server because of ${error.message}`);
  });
