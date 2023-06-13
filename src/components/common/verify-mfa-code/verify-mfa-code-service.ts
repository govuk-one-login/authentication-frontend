import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  JOURNEY_TYPE,
  MFA_METHOD_TYPE,
} from "../../../app.constants";
import {
  createApiResponse,
  getRequestConfig,
  http,
  Http,
} from "../../../utils/http";
import { ApiResponseResult, DefaultApiResponse } from "../../../types";
import { VerifyMfaCodeInterface } from "../../enter-authenticator-app-code/types";

export function verifyMfaCodeService(
  axios: Http = http
): VerifyMfaCodeInterface {
  const verifyMfaCode = async function (
    methodType: MFA_METHOD_TYPE,
    code: string,
    sessionId: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string,
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
      getRequestConfig({
        sessionId,
        clientSessionId,
        sourceIp: sourceIp,
        persistentSessionId: persistentSessionId,
      })
    );
    return createApiResponse(response, [HTTP_STATUS_CODES.NO_CONTENT]);
  };

  return {
    verifyMfaCode,
  };
}
