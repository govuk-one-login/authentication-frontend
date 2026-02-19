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
import type { Request, Response } from "express";

export function accountInterventionService(
  axios: Http = http
): AccountInterventionsInterface {
  const accountInterventionStatus = async function (
    emailAddress: string,
    req: Request,
    res: Response,
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
        req,
        res,
        API_ENDPOINTS.ACCOUNT_INTERVENTIONS
      )
    );

    return createApiResponse<AccountInterventionStatus>(response);
  };

  return {
    accountInterventionStatus,
  };
}
