import axios from "axios";
import { getApiKey, getFrontendApiBaseUrl, supportHttpKeepAlive, } from "../config";
import { HTTP_STATUS_CODES } from "../app.constants";
import { ApiError } from "./error";
import { createPersonalDataHeaders } from "@govuk-one-login/frontend-passthrough-headers";
import { logger } from "./logger";
import { Agent } from "https";
const headers = {
    Accept: "application/json",
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Credentials": "true",
    "X-Requested-With": "XMLHttpRequest",
};
export function createApiResponse(response, status = [HTTP_STATUS_CODES.OK]) {
    return {
        success: status.includes(response.status),
        data: response.data,
    };
}
function getSecurityHeaders(path, req, baseUrl) {
    let personalDataHeaders = {};
    let url = "";
    try {
        const basePath = baseUrl || getFrontendApiBaseUrl();
        url = new URL(path, basePath).toString();
        personalDataHeaders = createPersonalDataHeaders(url, req);
    }
    catch (err) {
        logger.warn(`Called with ${url}. Failed to set security headers due to: ${err.message}`);
    }
    return personalDataHeaders;
}
export function getInternalRequestConfigWithSecurityHeaders(options, req, path) {
    const config = {
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
        config.validateStatus = function (status) {
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
    instance;
    get client() {
        return this.instance || this.initHttp();
    }
    static handleError(error) {
        let apiError;
        if (error.response && error.response.data) {
            apiError = new ApiError(error.message, error.response.status, error.response.data);
        }
        else {
            apiError = new ApiError(error.message);
        }
        return Promise.reject(apiError);
    }
    initHttp() {
        const http = axios.create({
            baseURL: getFrontendApiBaseUrl(),
            headers: headers,
            validateStatus: (status) => {
                return (status >= HTTP_STATUS_CODES.OK &&
                    status <= HTTP_STATUS_CODES.BAD_REQUEST);
            },
            ...getAdditionalAxiosConfig(),
        });
        http.interceptors.response.use((response) => response, (error) => Http.handleError(error));
        this.instance = http;
        return http;
    }
}
export function getAdditionalAxiosConfig() {
    return supportHttpKeepAlive()
        ? { httpsAgent: new Agent({ keepAlive: true }) }
        : {};
}
export const http = new Http();
