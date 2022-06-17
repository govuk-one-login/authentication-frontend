import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  MFA_METHOD_TYPE,
} from "../../app.constants";
import {
  createApiResponse,
  getRequestConfig,
  http,
  Http,
} from "../../utils/http";
import { ApiResponseResult, DefaultApiResponse } from "../../types";
import { VerifyMfaCodeInterface } from "./types";

export function authenticatorAppCodeService(
  axios: Http = http
): VerifyMfaCodeInterface {
  const verifyMfaCode = async function (
    methodType: MFA_METHOD_TYPE,
    code: string,
    isRegistration: boolean,
    sessionId: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.VERIFY_MFA_CODE,
      {
        mfaMethodType: methodType,
        code: code,
        isRegistration: isRegistration,
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
