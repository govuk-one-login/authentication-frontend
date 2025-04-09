import { createApp, shutdownProcess, startServer } from "./app.js";
import { logger } from "./utils/logger.js";
(async () => {
  const app = await createApp();
  const { closeServer } = await startServer(app);
  const shutdown = shutdownProcess(closeServer);
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
})().catch((ex) => {
  logger.error(`Server failed to create app ${ex.message}`);
});
