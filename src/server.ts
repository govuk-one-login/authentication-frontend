import http from "http";
import { createApp } from "./app";
import Logger, { getLogLabel } from "./utils/logger";

const app = createApp();
const port: number | string = process.env.PORT || 3000;

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

const server = http.createServer(app);

server
  .listen(port, () => {
    logger.info(`Server listening on port ${port}`, logLabel);
  })
  .on("error", (error: Error) => {
    logger.error(
      `Unable to start server because of ${error.message}`,
      logLabel
    );
  });
