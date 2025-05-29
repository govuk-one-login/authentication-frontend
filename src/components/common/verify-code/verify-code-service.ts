import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants.js";
import type { Http } from "../../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../../utils/http.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import type { VerifyCodeInterface } from "./types.js";
import type { Request } from "express";

export function codeService(axios: Http = http): VerifyCodeInterface {
  const verifyCode = async function (
    sessionId: string,
    code: string,
    notificationType: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    mfaMethodId: string,
    journeyType?: string
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.VERIFY_CODE,
      { code, notificationType, journeyType, mfaMethodId },
      getInternalRequestConfigWithSecurityHeaders(
        { sessionId, clientSessionId, persistentSessionId: persistentSessionId },
        req,
        API_ENDPOINTS.VERIFY_CODE
      )
    );

    return createApiResponse(response, [HTTP_STATUS_CODES.NO_CONTENT]);
  };

  return { verifyCode };
}
