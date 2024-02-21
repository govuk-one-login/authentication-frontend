import { RedisClientOptions, createClient } from "redis";
import RedisStore from "connect-redis";
import { RedisConfig } from "src/utils/types";

export function getSessionStore(redisConfig: RedisConfig): RedisStore {
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

  const client = createClient(config);
  client.connect();

  return new RedisStore({
    client,
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
