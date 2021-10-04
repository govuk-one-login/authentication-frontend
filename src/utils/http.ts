import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from "axios";
import { getApiKey, getFrontendApiBaseUrl } from "../config";
import { logger } from "./logger";
import { ApiResponseResult } from "../types";
import { HTTP_STATUS_CODES } from "../app.constants";

const headers: Readonly<Record<string, string | boolean>> = {
  Accept: "application/json",
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Credentials": true,
  "X-Requested-With": "XMLHttpRequest",
};

export interface ConfigOptions {
  sessionId?: string;
  clientSessionId?: string;
  validationStatues?: number[];
  sourceIp?: string;
}

export function createApiResponse(
  response: AxiosResponse,
  status: number = HTTP_STATUS_CODES.OK
): ApiResponseResult {
  return {
    success: response.status === status,
    code: response.data.code,
    message: response.data.message,
    sessionState: response.data.sessionState,
  };
}

export function getRequestConfig(options: ConfigOptions): AxiosRequestConfig {
  const config: AxiosRequestConfig = {
    headers: {
      "X-API-Key": getApiKey(),
    },
    proxy: false,
  };

  if (options.sessionId) {
    config.headers["Session-Id"] = options.sessionId;
  }

  if (options.clientSessionId) {
    config.headers["Client-Session-Id"] = options.clientSessionId;
  }

  if (options.sourceIp) {
    config.headers["X-Forwarded-For"] = options.sourceIp;
  }

  if (options.validationStatues) {
    config.validateStatus = function (status: number) {
      return options.validationStatues.includes(status);
    };
  }

  return config;
}

export class Http {
  private instance: AxiosInstance;

  get client(): AxiosInstance {
    return this.instance || this.initHttp();
  }

  private static handleError(error: AxiosError) {
    const { response } = error;
    const { data } = response || {};

    if (data) {
      logger.error(error.message, { error: JSON.stringify(data) });
    } else {
      logger.error(error.message);
    }

    return Promise.reject(error);
  }

  private initHttp() {
    const http = axios.create({
      baseURL: getFrontendApiBaseUrl(),
      headers: headers,
      validateStatus: (status) => {
        return (
          status >= HTTP_STATUS_CODES.OK &&
          status <= HTTP_STATUS_CODES.BAD_REQUEST
        );
      },
    });

    http.interceptors.response.use(
      (response) => response,
      (error) => Http.handleError(error)
    );

    this.instance = http;
    return http;
  }
}
export const http = new Http();
