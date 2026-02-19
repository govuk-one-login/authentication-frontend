import { API_ENDPOINTS } from "../../../app.constants.js";
import type { Http } from "../../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../../utils/http.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import type {
  AccountRecoveryInterface,
  AccountRecoveryResponse,
} from "./types.js";
import type { Request, Response } from "express";

export function accountRecoveryService(
  axios: Http = http
): AccountRecoveryInterface {
  const accountRecovery = async function (
    email: string,
    req: Request,
    res: Response
  ): Promise<ApiResponseResult<AccountRecoveryResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.ACCOUNT_RECOVERY,
      {
        email,
      },
      getInternalRequestConfigWithSecurityHeaders(
        req,
        res,
        API_ENDPOINTS.ACCOUNT_RECOVERY
      )
    );

    return createApiResponse<AccountRecoveryResponse>(response);
  };

  return {
    accountRecovery,
  };
}
