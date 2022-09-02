import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
  AxiosRequestHeaders,
} from "axios";
import { getApiKey, getFrontendApiBaseUrl } from "../config";
import { ApiResponseResult } from "../types";
import { HTTP_STATUS_CODES } from "../app.constants";
import { ApiError } from "./error";

const headers: AxiosRequestHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Credentials": "true",
  "X-Requested-With": "XMLHttpRequest",
};

export interface ConfigOptions {
  sessionId?: string;
  clientSessionId?: string;
  validationStatues?: number[];
  sourceIp?: string;
  persistentSessionId?: string;
  baseURL?: string;
  userLanguage?: string;
}

export function createApiResponse<T>(
  response: AxiosResponse,
  status: number[] = [HTTP_STATUS_CODES.OK]
): ApiResponseResult<T> {
  return {
    success: status.includes(response.status),
    data: response.data,
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

  if (options.persistentSessionId) {
    config.headers["di-persistent-session-id"] = options.persistentSessionId;
  }

  if (options.baseURL) {
    config.baseURL = options.baseURL;
  }

  if (options.userLanguage) {
    config.headers["User-Language"] = options.userLanguage;
  }

  return config;
}

export class Http {
  private instance: AxiosInstance;

  get client(): AxiosInstance {
    return this.instance || this.initHttp();
  }

  private static handleError(error: AxiosError) {
    let apiError;

    if (error.response && error.response.data) {
      apiError = new ApiError(
        error.message,
        error.response.status,
        error.response.data
      );
    } else {
      apiError = new ApiError(error.message);
    }

    return Promise.reject(apiError);
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
