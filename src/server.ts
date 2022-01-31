import { createApp } from "./app";
import { logger } from "./utils/logger";

const port: number | string = process.env.PORT || 3000;

(async () => {
  const app = await createApp();
  app
    .listen(port, () => {
      logger.info(`Server listening on port ${port}`);
      app.emit("appStarted");
    })
    .on("error", (error: Error) => {
      logger.error(`Unable to start server because of ${error.message}`);
    });
})().catch((ex) => {
  logger.error(`Server failed to create app ${ex.message}`);
});
