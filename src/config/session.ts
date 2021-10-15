import redis, { ClientOpts } from "redis";
import connect_redis, { RedisStore } from "connect-redis";
import session from "express-session";
import CF_CONFIG from "./cf";
import { getRedisHost, getRedisPort } from "../config";
const RedisStore = connect_redis(session);

export interface RedisConfigCf {
  host: string;
  name: string;
  port: string;
  password: string;
  uri: string;
}

export function getSessionStore(): RedisStore {
  let config: ClientOpts;
  if (CF_CONFIG.isLocal) {
    config = {
      host: getRedisHost(),
      port: getRedisPort()
    };
  } else {
    const redisConfig = CF_CONFIG.getServiceCreds(
      /-redis$/gims
    ) as RedisConfigCf;
    config = {
      host: redisConfig.host,
      port: parseInt(redisConfig.port),
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
