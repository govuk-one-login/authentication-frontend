import { createApp, shutdownProcess, startServer } from "./app";
import { logger } from "./utils/logger";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"; // configure the SDK to export telemetry data to the console
// initialize the SDK and register with the OpenTelemetry API
// this enables the API to record telemetry
// enable all auto-instrumentations from the meta package
new NodeSDK({
  instrumentations: [getNodeAutoInstrumentations()],
}).start();

(async () => {
  const app = await createApp();
  const { closeServer } = await startServer(app);
  const shutdown = shutdownProcess(closeServer);
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
})().catch((ex) => {
  logger.error(`Server failed to create app ${ex.message}`);
});
