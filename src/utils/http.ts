import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { getApiBaseUrl } from "../config";
import Logger, { getLogLabel } from "./logger";
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from "../app.constants";

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

class Http {
  private instance: AxiosInstance;

  private headers: Readonly<Record<string, string | boolean>> = {
    Accept: "application/json",
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Credentials": true,
    "X-Requested-With": "XMLHttpRequest",
  };

  private _sessionId: string;

  set sessionId(sessionId : string) {
    this._sessionId = sessionId;
    }

  get client(): AxiosInstance {
    return this.instance || this.initHttp();
  }

  private handleError(error: any) {
    const { response } = error;
    let errorMessage: string;

    switch (response.status) {
      case HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR: {
        errorMessage = ERROR_MESSAGES.INVALID_HTTP_REQUEST;
        break;
      }
      case HTTP_STATUS_CODES.UNAUTHORIZED: {
        errorMessage = ERROR_MESSAGES.INVALID_SESSION;
        break;
      }
      case HTTP_STATUS_CODES.FORBIDDEN: {
        errorMessage = ERROR_MESSAGES.FORBIDDEN;
        break;
      }
      default:
        errorMessage = ERROR_MESSAGES.INVALID_HTTP_REQUEST;
    }

    const {data} = response;
    logger.error(errorMessage, logLabel, { error: JSON.stringify(data) });

    return Promise.reject(error);
  }

  private injectCustomHeaders(config: AxiosRequestConfig): AxiosRequestConfig {
    //TODO basic auth for api
    if(this._sessionId){
      config.headers = {
        "Session-Id": this._sessionId,
      };
    }
    return config;
  }

  initHttp() {
    const http = axios.create({
      baseURL: getApiBaseUrl(),
      headers: this.headers,
    });

    http.interceptors.request.use(this.injectCustomHeaders, (error) =>
      Promise.reject(error)
    );

    http.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );

    this.instance = http;
    return http;
  }
}

export const http = new Http();
