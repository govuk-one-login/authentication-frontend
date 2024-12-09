import { RedisClientOptions, createClient } from "redis";
import { RedisStore } from "connect-redis";
import { RedisConfig } from "src/utils/types";

let redisClient: ReturnType<typeof createClient> | undefined;
let usedRedisConfig: RedisConfig | undefined;

export function getSessionStore(redisConfig: RedisConfig): RedisStore {
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
