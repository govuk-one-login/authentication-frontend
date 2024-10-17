import { createApp, startServer } from "./app";
import { logger } from "./utils/logger";

(async () => {
  const app = await createApp();
  await startServer(app);
})().catch((ex) => {
  logger.error(`Server failed to create app ${ex.message}`);
});
