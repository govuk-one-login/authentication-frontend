import type { RedisClientOptions } from "redis";
import { createClient, SocketTimeoutError } from "redis";
import { RedisStore } from "connect-redis";
import type { RedisConfig } from "src/utils/types.js";
import { logger } from "../utils/logger.js";

let redisClient: ReturnType<typeof createClient> | undefined;
let usedRedisConfig: RedisConfig | undefined;
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 5;

export function getSessionStore(redisConfig: RedisConfig): RedisStore {
  if (redisClient && !isRedisConfigEqual(redisConfig, usedRedisConfig)) {
    throw new Error("Redis client already established with different config");
  } else if (!redisClient) {
    usedRedisConfig = redisConfig;

    const config: RedisClientOptions = {
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
        reconnectStrategy: (retries, cause) => {
          const jitter = Math.floor(Math.random() * 200);
          const delay = Math.min(Math.pow(2, retries) * 50, 2000);
        
          if (cause instanceof SocketTimeoutError) {
            logger.warn(
              { retries, delay: delay + jitter },
              "Redis socket timeout - reconnecting (default reconnectStrategy would've failed here)"
            );
          } else {
            logger.warn(
              { retries, delay: delay + jitter, cause: cause?.message },
              "Redis reconnecting"
            );
          }
        
          return delay + jitter;
        }
      },
    };

    if (redisConfig.tls) {
      config.socket.tls = redisConfig.tls;
    }
    if (redisConfig.password) {
      config.password = redisConfig.password;
    }

    redisClient = createClient(config);

    redisClient.on("error", (err) => {
      consecutiveErrors++;
      logger.error(err, `Redis client error (${consecutiveErrors})`);

      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS && redisClient) {
        logger.warn("Recreating Redis client after sustained failures");
        //redisClient.disconnect().catch(() => {});
        redisClient = undefined;
        usedRedisConfig = undefined;
      }
    });

    redisClient.on("ready", () => logger.info("Redis client ready"))
    redisClient.connect();
    usedRedisConfig = redisConfig;
  }

  return new RedisStore({
    client: redisClient,
  });
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
