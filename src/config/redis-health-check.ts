import type { createClient } from "redis";
import { logger } from "../utils/logger.js";

const HEALTH_CHECK_INTERVAL_MS = 10_000;
const HEALTH_CHECK_TIMEOUT_MS = 5_000;
const MAX_CONSECUTIVE_FAILURES = 3;

let healthCheckTimer: NodeJS.Timeout | undefined;
let consecutiveFailures = 0;

export function startHealthCheck(client: ReturnType<typeof createClient>) {
  stopHealthCheck();
  consecutiveFailures = 0;

  healthCheckTimer = setInterval(
    () => performHealthCheck(client),
    HEALTH_CHECK_INTERVAL_MS
  );
}

export function stopHealthCheck() {
  if (healthCheckTimer) {
    clearInterval(healthCheckTimer);
    healthCheckTimer = undefined;
  }
}

async function performHealthCheck(client: ReturnType<typeof createClient>) {
  if (!client.isReady) {
    logger.debug("Health check skipped - client not ready");
    return;
  }

  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    handleFailure(client, "Redis PING timed out - no response received");
  }, HEALTH_CHECK_TIMEOUT_MS);

  try {
    await client.ping();
    clearTimeout(timeout);
    handleSuccess();
  } catch (err) {
    if (!timedOut) {
      clearTimeout(timeout);
      handleFailure(client, "Redis PING failed with error", err);
    }
  }
}

function handleSuccess() {
  if (consecutiveFailures > 0) {
    logger.info({ previousFailures: consecutiveFailures }, "Redis PING recovered");
  }
  consecutiveFailures = 0;
}

function handleFailure(
  client: ReturnType<typeof createClient>,
  message: string,
  err?: unknown
) {
  consecutiveFailures++;
  logger.warn({ consecutiveFailures, max: MAX_CONSECUTIVE_FAILURES, err }, message);

  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    forceReconnect(client);
  }
}

function forceReconnect(client: ReturnType<typeof createClient>) {
  stopHealthCheck();
  logger.warn(
    "Forcing Redis reconnect after consecutive health check failures - DNS will re-resolve to new node"
  );

  try {
    client.destroy();
  } catch (err) {
    logger.error(err, "Error destroying Redis client");
  }

  client.connect().then(() => {
    logger.info("Redis client reconnected successfully after forced reconnect");
  }).catch((err) => {
    logger.error(err, "Redis client reconnect failed after forced reconnect");
  });
}
