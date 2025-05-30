import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import { API_ENDPOINTS } from "../../app.constants.js";
import type {
  AccountInterventionStatus,
  AccountInterventionsInterface,
} from "./types.js";
import type { ApiResponseResult } from "../../types.js";
import type { Request } from "express";

export function accountInterventionService(
  axios: Http = http
): AccountInterventionsInterface {
  const accountInterventionStatus = async function (
    sessionId: string,
    emailAddress: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    authenticated?: boolean
  ): Promise<ApiResponseResult<AccountInterventionStatus>> {
    const bodyWithEmail = { email: emailAddress.toLowerCase() };
    const body =
      authenticated !== undefined
        ? { ...bodyWithEmail, authenticated: authenticated }
        : bodyWithEmail;
    const response = await axios.client.post<AccountInterventionStatus>(
      API_ENDPOINTS.ACCOUNT_INTERVENTIONS,
      body,
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
