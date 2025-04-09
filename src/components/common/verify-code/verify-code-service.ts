import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
  Http,
} from "../../../utils/http.js";
import { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import { VerifyCodeInterface } from "./types.js";
import { Request } from "express";

export function codeService(axios: Http = http): VerifyCodeInterface {
  const verifyCode = async function (
    sessionId: string,
    code: string,
    notificationType: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    journeyType?: string
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.VERIFY_CODE,
      {
        code,
        notificationType,
        journeyType,
      },
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId,
          clientSessionId,
          persistentSessionId: persistentSessionId,
        },
        req,
        API_ENDPOINTS.VERIFY_CODE
      )
    );

    return createApiResponse(response, [HTTP_STATUS_CODES.NO_CONTENT]);
  };

  return {
    verifyCode,
  };
}
