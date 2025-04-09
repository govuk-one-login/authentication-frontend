import { Parameter } from "@aws-sdk/client-ssm";
import { RedisConfig } from "./types.js";
import { ENVIRONMENT_NAME } from "../app.constants.js";
import ssm from "./ssm.js";
import { getAppEnv, getNodeEnv } from "../config.js";
import { GetParametersCommandOutput } from "@aws-sdk/client-ssm/dist-types/commands/GetParametersCommand";
import * as process from "node:process";

function getRedisHost(): string | undefined {
  return getNodeEnv() !== ENVIRONMENT_NAME.PROD
    ? (process.env.REDIS_HOST ?? "redis")
    : process.env.REDIS_HOST;
}

function getRedisPort(): string | undefined {
  return getNodeEnv() !== ENVIRONMENT_NAME.PROD
    ? (process.env.REDIS_PORT ?? "6379")
    : process.env.REDIS_PORT;
}

function getRedisPassword(): string | undefined {
  return process.env.REDIS_PASSWORD;
}

export async function getRedisConfig(): Promise<RedisConfig> {
  let redisHost: string | undefined = getRedisHost();
  let redisPort: string | undefined = getRedisPort();
  let redisPassword: string | undefined = getRedisPassword();
  if (getNodeEnv() !== ENVIRONMENT_NAME.PROD) {
    return { host: getRedisHost(), port: Number(getRedisPort()) };
  }

  if (redisHost && redisPort && redisPassword) {
    return {
      host: redisHost,
      port: Number(redisPort),
      password: redisPassword,
      tls: true,
    };
  }

  const { hostKey, portKey, passwordKey } = getRedisKeys();

  const ssmParams: string[] = [];

  if (!redisHost) {
    ssmParams.push(hostKey);
  }
  if (!redisPort) {
    ssmParams.push(portKey);
  }
  if (!redisPassword) {
    ssmParams.push(passwordKey);
  }

  if (ssmParams.length !== 0) {
    const result = await fetchParametersFromSSM(ssmParams);

    if (ssmParams.includes(hostKey)) {
      redisHost = getValueFromSSMResult(result, hostKey);
    }
    if (ssmParams.includes(portKey)) {
      redisPort = getValueFromSSMResult(result, portKey);
    }
    if (ssmParams.includes(passwordKey)) {
      redisPassword = getValueFromSSMResult(result, passwordKey);
    }
  }

  return {
    host: redisHost,
    port: Number(redisPort),
    password: redisPassword,
    tls: true,
  };
}

function getRedisKeys(): {
  hostKey: string;
  portKey: string;
  passwordKey: string;
} {
  const appEnv = getAppEnv();
  const redisKey = process.env.REDIS_KEY;
  if (!process.env.REDIS_KEY) {
    throw Error("There is no REDIS_KEY present in env variables");
  }
  return {
    hostKey: `${appEnv}-${redisKey}-redis-master-host`,
    portKey: `${appEnv}-${redisKey}-redis-port`,
    passwordKey: `${appEnv}-${redisKey}-redis-password`,
  };
}

function getValueFromSSMResult(
  result: { Parameters?: Parameter[] },
  key: string
): string {
  const maybeValue = result.Parameters?.find(
    (p: Parameter) => p.Name === key
  )?.Value;
  if (maybeValue === undefined) {
    throw Error(`Expected to find key ${key} in ssm parameters`);
  } else {
    return maybeValue;
  }
}

async function fetchParametersFromSSM(
  ssmParams: string[]
): Promise<GetParametersCommandOutput> {
  const params = {
    Names: ssmParams,
    WithDecryption: true,
  };

  const result = await ssm.getParameters(params);

  if (result.InvalidParameters && result.InvalidParameters.length > 0) {
    throw Error("Invalid SSM config values for redis");
  }

  return result;
}
