import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import type { ApiResponseResult } from "../../types.js";
import { API_ENDPOINTS } from "../../app.constants.js";
import type { Request } from "express";
import type { AMCResultInterface } from "./types.js";

export function amcResultService(axios: Http = http): AMCResultInterface {
  const getAMCResult = async function (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    code: string,
    state: string
  ): Promise<ApiResponseResult<string>> {
    const config = getInternalRequestConfigWithSecurityHeaders(
      {
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        persistentSessionId: persistentSessionId,
      },
      req,
      API_ENDPOINTS.AMC_CALLBACK
    );

    const response = await axios.client.post<string>(
      API_ENDPOINTS.AMC_CALLBACK,
      { code, state },
      config
    );

    return createApiResponse<string>(response);
  };

  return {
    getAMCResult,
  };
}
