import { API_ENDPOINTS } from "../../../app.constants.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
  Http,
} from "../../../utils/http.js";
import { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import { AccountRecoveryInterface, AccountRecoveryResponse } from "./types.js";
import { Request } from "express";

export function accountRecoveryService(
  axios: Http = http
): AccountRecoveryInterface {
  const accountRecovery = async function (
    sessionId: string,
    clientSessionId: string,
    email: string,
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
