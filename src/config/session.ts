import type { RedisClientOptions } from "redis";
import { createClient } from "redis";
import { RedisStore } from "connect-redis";
import type { RedisConfig } from "../utils/types.js";
import { logger } from "../utils/logger.js";
import { DualSessionStore } from "./dual-session-store.js";
import { getDynamoSessionStore } from "./dynamodb-session.js";
import {
  getSessionDualWriteEnabled,
  getSessionDynamoPrimaryEnabled,
} from "../config.js";
import type { Store } from "express-session";

let redisClient: ReturnType<typeof createClient> | undefined;
let usedRedisConfig: RedisConfig | undefined;

function getRedisStore(redisConfig: RedisConfig): RedisStore {
  if (redisClient && !isRedisConfigEqual(redisConfig, usedRedisConfig)) {
    throw new Error("Redis client already established with different config");
  } else if (!redisClient) {
    usedRedisConfig = redisConfig;

    const config: RedisClientOptions = {
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
      },
    };

    if (redisConfig.tls) {
      config.socket.tls = redisConfig.tls;
    }
    if (redisConfig.password) {
      config.password = redisConfig.password;
    }

    redisClient = createClient(config);
    redisClient.on("error", (err) => logger.error(err, "Redis client error"));
    redisClient.connect();
    usedRedisConfig = redisConfig;
  }

  return new RedisStore({
    client: redisClient,
  });
}

export function getSessionStore(redisConfig: RedisConfig): Store {
  const redisStore = getRedisStore(redisConfig);

  if (!getSessionDualWriteEnabled()) {
    logger.info(
      "Dual session store writing feature flag disabled, using Redis store."
    );

    return redisStore;
  }

  logger.info(
    "Dual session store writing feature flag enabled, using dual session store."
  );

  const dynamoStore = getDynamoSessionStore();

  if (getSessionDynamoPrimaryEnabled()) {
    logger.info(
      "Dual session store DynamoDB primary feature flag enabled, using dual session store with DynamoDB as primary."
    );

    return new DualSessionStore(dynamoStore, redisStore, "DynamoDB", "Redis");
  }

  logger.info(
    "Dual session store DynamoDB primary feature flag disabled, using dual session store with Redis as primary."
  );

  return new DualSessionStore(redisStore, dynamoStore, "Redis", "DynamoDB");
}

export async function disconnectRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.disconnect();
    redisClient = undefined;
    usedRedisConfig = undefined;
  }
}

export function getSessionCookieOptions(
  isProdEnv: boolean,
  expiry: number,
  secret: string
): any {
  return {
    name: "aps",
    maxAge: expiry,
    secret: secret,
    signed: true,
    secure: isProdEnv,
  };
}

export function isRedisConfigEqual(a: RedisConfig, b: RedisConfig): boolean {
  const keys = new Set<keyof typeof a & keyof typeof b>();
  (Object.keys(a) as (keyof typeof a)[]).forEach((k) => keys.add(k));
  (Object.keys(b) as (keyof typeof b)[]).forEach((k) => keys.add(k));
  return (
    Array.from(keys).reduce((acc, k) => acc + (a[k] === b[k] ? 0 : 1), 0) === 0
  );
}
