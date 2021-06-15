import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { apiBaseUrl } from "../config";
import Logger, { getLogLabel } from "./logger";

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

  get client(): AxiosInstance {
    return this.instance || this.initHttp();
  }

  private handleError(error: any) {
    logger.error("failed http request", logLabel);
    return Promise.reject(error);
  }

  private injectCustomHeaders(config: AxiosRequestConfig): AxiosRequestConfig {
    //TODO this needs implementing
    config.headers["Session-Id"] = "123456";
    return config; //TODO basic auth for api
  }

  initHttp() {
    const http = axios.create({
      baseURL: apiBaseUrl(),
      headers: this.headers,
    });

    http.interceptors.request.use(this.injectCustomHeaders, (error) =>
      Promise.reject(error)
    );

    http.interceptors.response.use(
      (response) => response,
      (error) => {
        const { response } = error;
        return this.handleError(response);
      }
    );

    this.instance = http;
    return http;
  }
}

export const http = new Http();
