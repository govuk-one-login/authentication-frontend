import type {
  ReverificationResultInterface,
  ReverificationResultResponse,
} from "./types.js";
import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import { API_ENDPOINTS } from "../../app.constants.js";
import type { Request } from "express";

export function reverificationResultService(
  axios: Http = http
): ReverificationResultInterface {
  const getReverificationResult = async function (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    email: string,
    code: string,
    state: string
  ): Promise<ApiResponseResult<ReverificationResultResponse>> {
    const config = getInternalRequestConfigWithSecurityHeaders(
      {
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        persistentSessionId: persistentSessionId,
      },
      req,
      API_ENDPOINTS.REVERIFICATION_RESULT
    );

    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.REVERIFICATION_RESULT,
      { email, code, state },
      config
    );

    return createApiResponse<ReverificationResultResponse>(response);
  };

  return {
    getReverificationResult,
  };
}
