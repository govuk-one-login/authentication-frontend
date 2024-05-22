import { API_ENDPOINTS } from "../../../app.constants";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
  Http,
} from "../../../utils/http";
import { ApiResponseResult, DefaultApiResponse } from "../../../types";
import { AccountRecoveryInterface, AccountRecoveryResponse } from "./types";
import { Request } from "express";

export function accountRecoveryService(
  axios: Http = http
): AccountRecoveryInterface {
  const accountRecovery = async function (
    sessionId: string,
    clientSessionId: string,
    email: string,
    sourceIp: string,
    persistentSessionId: string,
    req: Request
  ): Promise<ApiResponseResult<AccountRecoveryResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.ACCOUNT_RECOVERY,
      {
        email,
      },
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId,
          clientSessionId,
          sourceIp,
          persistentSessionId,
        },
        req,
        API_ENDPOINTS.ACCOUNT_RECOVERY
      )
    );

    return createApiResponse<AccountRecoveryResponse>(response);
  };

  return {
    accountRecovery,
  };
}
