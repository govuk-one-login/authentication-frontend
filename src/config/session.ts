import redis, { ClientOpts } from "redis";
import connect_redis, { RedisStore } from "connect-redis";
import session from "express-session";
import CF_CONFIG from "./cf";
import { getRedisHost, getRedisPort, isFargate } from "../config";
import { RedisConfig } from "src/utils/types";
const RedisStore = connect_redis(session);

export interface RedisConfigCf {
  host: string;
  name: string;
  port: string;
  password: string;
  uri: string;
}

export function getSessionStore(redisConfig: RedisConfig): RedisStore {
  let config: ClientOpts;
  if (isFargate()) {
    config = {
      host: redisConfig.host,
      port: parseInt(redisConfig.port),
      password: redisConfig.password,
      tls: true,
    };
  } else if (CF_CONFIG.isLocal) {
    config = {
      host: getRedisHost(),
      port: getRedisPort(),
    };
  } else {
    const redisConfigCf = CF_CONFIG.getServiceCreds(
      /-redis$/gims
    ) as RedisConfig;
    config = {
      host: redisConfigCf.host,
      port: parseInt(redisConfigCf.port),
      password: redisConfigCf.password,
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
