import type { JOURNEY_TYPE, MFA_METHOD_TYPE } from "../../../app.constants.js";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants.js";
import type { Http } from "../../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../../utils/http.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import type { VerifyMfaCodeInterface } from "../../enter-authenticator-app-code/types.js";
import type { Request } from "express";

export function verifyMfaCodeService(axios: Http = http): VerifyMfaCodeInterface {
  const verifyMfaCode = async function (
    methodType: MFA_METHOD_TYPE,
    code: string,
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    journeyType?: JOURNEY_TYPE,
    profileInformation?: string
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.VERIFY_MFA_CODE,
      {
        mfaMethodType: methodType,
        code,
        journeyType,
        ...(profileInformation && { profileInformation }),
      },
      getInternalRequestConfigWithSecurityHeaders(
        { sessionId, clientSessionId, persistentSessionId: persistentSessionId },
        req,
        API_ENDPOINTS.VERIFY_MFA_CODE
      )
    );
    return createApiResponse(response, [HTTP_STATUS_CODES.NO_CONTENT]);
  };

  return { verifyMfaCode };
}
