import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
  AxiosRequestHeaders,
  CreateAxiosDefaults,
} from "axios";
import axios from "axios";
import {
  getApiKey,
  getFrontendApiBaseUrl,
  supportHttpKeepAlive,
} from "../config.js";
import type { ApiResponseResult } from "../types.js";
import { HTTP_STATUS_CODES } from "../app.constants.js";
import { ApiError } from "./error.js";
import type { Request } from "express";
import { createPersonalDataHeaders } from "@govuk-one-login/frontend-passthrough-headers";
import { Agent } from "https";

type CustomAxiosRequestHeaders = Partial<AxiosRequestHeaders>;

const headers: CustomAxiosRequestHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Credentials": "true",
  "X-Requested-With": "XMLHttpRequest",
};

export interface ConfigOptions {
  sessionId?: string;
  clientSessionId?: string;
  validationStatuses?: number[];
  persistentSessionId?: string;
  baseURL?: string;
  userLanguage?: string;
  reauthenticate?: boolean;
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

function getSecurityHeaders(path: string, req: Request, baseUrl?: string) {
  let personalDataHeaders = {};
  let url = "";
  try {
    const basePath = baseUrl || getFrontendApiBaseUrl();
    url = new URL(path, basePath).toString();
    personalDataHeaders = createPersonalDataHeaders(url, req);
  } catch (err) {
    req.log.warn(
      `Called with ${url}. Failed to set security headers due to: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
  return personalDataHeaders;
}

export function getInternalRequestConfigWithSecurityHeaders(
  options: ConfigOptions,
  req: Request,
  path: string
): AxiosRequestConfig {
  const config: AxiosRequestConfig = {
    headers: {
      "X-API-Key": getApiKey(),
      ...getSecurityHeaders(path, req, options.baseURL),
    },
    proxy: false,
  };

  if (options.sessionId) {
    config.headers["Session-Id"] = options.sessionId;
  }

  if (options.clientSessionId) {
    config.headers["Client-Session-Id"] = options.clientSessionId;
  }

  if (options.validationStatuses) {
    config.validateStatus = function (status: number) {
      return options.validationStatuses.includes(status);
    };
  }

  if (options.persistentSessionId) {
    config.headers["di-persistent-session-id"] = options.persistentSessionId;
  }

  if (options.baseURL) {
    config.baseURL = options.baseURL;
  }

  if (options.reauthenticate) {
    config.headers["Reauthenticate"] = options.reauthenticate;
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
      ...getAdditionalAxiosConfig(),
    });

    http.interceptors.request.use(
      (config) => {
        console.log('Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          headers: config.headers,
          data: config.data
        });
        return config;
      },
      (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
      }
    );

    http.interceptors.response.use(
      (response) => {
        console.log('Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data
        });
        return response;
      },
      (error) => {
        console.error('Response Error:', {
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data
        });
        return Http.handleError(error);
      }
    );

    this.instance = http;
    return http;
  }
}

export function getAdditionalAxiosConfig(): CreateAxiosDefaults {
  return supportHttpKeepAlive()
    ? { httpsAgent: new Agent({ keepAlive: true }) }
    : {};
}

export const http = new Http();
