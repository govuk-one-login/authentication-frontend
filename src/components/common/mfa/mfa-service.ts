import { MfaServiceInterface } from "./types.js";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  JOURNEY_TYPE,
} from "../../../app.constants.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
  Http,
} from "../../../utils/http.js";
import { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import { Request } from "express";

export function mfaService(axios: Http = http): MfaServiceInterface {
  const sendMfaCode = async function (
    sessionId: string,
    clientSessionId: string,
    emailAddress: string,
    persistentSessionId: string,
    isResendCodeRequest: boolean,
    userLanguage: string,
    req: Request,
    journeyType?: JOURNEY_TYPE
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.MFA,
      {
        email: emailAddress,
        isResendCodeRequest,
        journeyType,
      },
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

  return {
    sendMfaCode,
  };
}
