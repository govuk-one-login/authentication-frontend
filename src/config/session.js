import { createClient } from "redis";
import { RedisStore } from "connect-redis";
let redisClient;
let usedRedisConfig;
export function getSessionStore(redisConfig) {
    if (redisClient && !isRedisConfigEqual(redisConfig, usedRedisConfig)) {
        throw new Error("Redis client already established with different config");
    }
    else if (!redisClient) {
        usedRedisConfig = redisConfig;
        const config = {
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
export async function disconnectRedisClient() {
    if (redisClient) {
        await redisClient.disconnect();
        redisClient = undefined;
        usedRedisConfig = undefined;
    }
}
export function getSessionCookieOptions(isProdEnv, expiry, secret) {
    return {
        name: "aps",
        maxAge: expiry,
        secret: secret,
        signed: true,
        secure: isProdEnv,
    };
}
export function isRedisConfigEqual(a, b) {
    const keys = new Set();
    Object.keys(a).forEach((k) => keys.add(k));
    Object.keys(b).forEach((k) => keys.add(k));
    return (Array.from(keys).reduce((acc, k) => acc + (a[k] === b[k] ? 0 : 1), 0) === 0);
}
