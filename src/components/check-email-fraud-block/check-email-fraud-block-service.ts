import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import { API_ENDPOINTS } from "../../app.constants.js";
import type { ApiResponseResult } from "../../types.js";
import type {
  CheckEmailFraudBlockInterface,
  CheckEmailFraudBlockResponse,
} from "./types.js";
import type { Request, Response } from "express";

export function checkEmailFraudBlockService(
  axios: Http = http
): CheckEmailFraudBlockInterface {
  const checkEmailFraudBlock = async function (
    email: string,
    req: Request,
    res: Response
  ): Promise<ApiResponseResult<CheckEmailFraudBlockResponse>> {
    const response = await axios.client.post<CheckEmailFraudBlockResponse>(
      API_ENDPOINTS.CHECK_EMAIL_FRAUD_BLOCK,
      {
        email: email.toLowerCase(),
      },
      getInternalRequestConfigWithSecurityHeaders(
        req,
        res,
        API_ENDPOINTS.CHECK_EMAIL_FRAUD_BLOCK
      )
    );
    return createApiResponse<CheckEmailFraudBlockResponse>(response);
  };
  return {
    checkEmailFraudBlock,
  };
}
