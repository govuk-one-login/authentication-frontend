import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants.js";
import type { Http } from "../../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../../utils/http.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import type { VerifyCodeInterface } from "./types.js";
import type { Request, Response } from "express";

export function codeService(axios: Http = http): VerifyCodeInterface {
  const verifyCode = async function (
    code: string,
    notificationType: string,
    req: Request,
    res: Response,
    mfaMethodId: string,
    journeyType?: string
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.VERIFY_CODE,
      {
        code,
        notificationType,
        journeyType,
        mfaMethodId,
      },
      getInternalRequestConfigWithSecurityHeaders(
        req,
        res,
        API_ENDPOINTS.VERIFY_CODE
      )
    );

    return createApiResponse(response, [HTTP_STATUS_CODES.NO_CONTENT]);
  };

  return {
    verifyCode,
  };
}
