import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
import {
  AccountInterventionStatus,
  AccountInterventionsInterface,
} from "./types";
import { ApiResponseResult } from "../../types";
import { Request } from "express";

export function accountInterventionService(
  axios: Http = http
): AccountInterventionsInterface {
  const accountInterventionStatus = async function (
    sessionId: string,
    emailAddress: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ): Promise<ApiResponseResult<AccountInterventionStatus>> {
    const response = await axios.client.post<AccountInterventionStatus>(
      API_ENDPOINTS.ACCOUNT_INTERVENTIONS,
      {
        email: emailAddress.toLowerCase(),
      },
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
          clientSessionId: clientSessionId,
          persistentSessionId: persistentSessionId,
        },
        req,
        API_ENDPOINTS.ACCOUNT_INTERVENTIONS
      )
    );

    return createApiResponse<AccountInterventionStatus>(response);
  };

  return {
    accountInterventionStatus,
  };
}
