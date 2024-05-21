import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
import { ApiResponseResult } from "../../types";
import {
  CheckEmailFraudBlockInterface,
  CheckEmailFraudBlockResponse,
} from "./types";
import { Request } from "express";

export function checkEmailFraudBlockService(
  axios: Http = http
): CheckEmailFraudBlockInterface {
  const checkEmailFraudBlock = async function (
    email: string,
    sessionId: string,
    sourceIp: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ): Promise<ApiResponseResult<CheckEmailFraudBlockResponse>> {
    const response = await axios.client.post<CheckEmailFraudBlockResponse>(
      API_ENDPOINTS.CHECK_EMAIL_FRAUD_BLOCK,
      {
        email: email.toLowerCase(),
      },
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
          sourceIp: sourceIp,
          clientSessionId: clientSessionId,
          persistentSessionId: persistentSessionId,
        },
        req,
        API_ENDPOINTS.CHECK_EMAIL_FRAUD_BLOCK
      )
    );
    return createApiResponse<CheckEmailFraudBlockResponse>(response);
  };
  return {
    checkEmailFraudBlock,
  };
}
