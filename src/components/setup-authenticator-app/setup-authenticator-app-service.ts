import {
  createApiResponse,
  getRequestConfig,
  Http,
  http,
} from "../../utils/http";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  MFA_METHOD_TYPE,
} from "../../app.constants";
import { ApiResponseResult, DefaultApiResponse } from "../../types";

export function setupAuthAppService(axios: Http = http): any {
  const verifyAccessCode = async function (
    code: string,
    sourceIp: string,
    sessionId: string,
    persistentSessionId: string,
    clientSessionId: string
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.VERIFY_MFA_CODE,
      {
        mfaMethodType: MFA_METHOD_TYPE.AUTH_APP,
        code: code,
        isRegistration: true,
      },
      getRequestConfig({
        validationStatues: [
          HTTP_STATUS_CODES.BAD_REQUEST,
          HTTP_STATUS_CODES.NO_CONTENT,
        ],
        sourceIp: sourceIp,
        sessionId: sessionId,
        persistentSessionId: persistentSessionId,
        clientSessionId: clientSessionId,
      })
    );

    return createApiResponse<DefaultApiResponse>(response, [
      HTTP_STATUS_CODES.NO_CONTENT,
    ]);
  };

  return {
    verifyAccessCode,
  };
}
