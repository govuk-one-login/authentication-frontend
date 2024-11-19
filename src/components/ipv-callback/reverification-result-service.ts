import { ReverificationResultInterface } from "./types";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
  Http,
} from "../../utils/http";
import { ApiResponseResult, DefaultApiResponse } from "../../types";
import { API_ENDPOINTS } from "../../app.constants";
import { Request } from "express";

export function reverificationResultService(
  axios: Http = http
): ReverificationResultInterface {
  const getReverificationResult = async function (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    email: string,
    code: string
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
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
      { email, code },
      config
    );

    return createApiResponse<DefaultApiResponse>(response);
  };

  return {
    getReverificationResult,
  };
}
