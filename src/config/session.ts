import redis, { ClientOpts } from "redis";
import connect_redis, { RedisStore } from "connect-redis";
import session from "express-session";
import { getRedisHost, getRedisPort } from "../config";
import { RedisConfig } from "src/utils/types";
const RedisStore = connect_redis(session);

export function getSessionStore(redisConfig: RedisConfig): RedisStore {
  let config: ClientOpts;

  if (redisConfig.isLocal) {
    config = {
      host: getRedisHost(),
      port: getRedisPort(),
    };
  } else {
    config = {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      tls: true,
    };
  }

  return new RedisStore({
    client: redis.createClient(config),
  });
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
