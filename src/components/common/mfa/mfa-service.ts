import type { MfaServiceInterface } from "./types.js";
import type { JOURNEY_TYPE } from "../../../app.constants.js";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants.js";
import type { Http } from "../../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../../utils/http.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import type { Request } from "express";

export function mfaService(axios: Http = http): MfaServiceInterface {
  const sendMfaCode = async function (
    sessionId: string,
    clientSessionId: string,
    emailAddress: string,
    persistentSessionId: string,
    isResendCodeRequest: boolean,
    userLanguage: string,
    req: Request,
    mfaMethodId: string,
    journeyType?: JOURNEY_TYPE
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.MFA,
      { email: emailAddress, isResendCodeRequest, journeyType, mfaMethodId },
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
          clientSessionId: clientSessionId,
          persistentSessionId: persistentSessionId,
          userLanguage: userLanguage,
        },
        req,
        API_ENDPOINTS.MFA
      )
    );

    return createApiResponse<DefaultApiResponse>(response, [
      HTTP_STATUS_CODES.NO_CONTENT,
    ]);
  };

  return { sendMfaCode };
}
