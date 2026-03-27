import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import { API_ENDPOINTS } from "../../app.constants.js";
import type { Request } from "express";
import type { AMCResultInterface, AMCServiceResult } from "./types.js";

export function amcResultService<T>(axios: Http = http): AMCResultInterface<T> {
  const getAMCResult = async function (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    code: string,
    state: string,
    usedRedirectUrl: string,
    language: string
  ): Promise<AMCServiceResult<T>> {
    const config = getInternalRequestConfigWithSecurityHeaders(
      {
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        persistentSessionId: persistentSessionId,
        userLanguage: language,
      },
      req,
      API_ENDPOINTS.AMC_CALLBACK
    );

    const response = await axios.client.post<T>(
      API_ENDPOINTS.AMC_CALLBACK,
      { code, state, usedRedirectUrl },
      config
    );

    return createApiResponse<T>(response) as AMCServiceResult<T>;
  };

  return {
    getAMCResult,
  };
}
