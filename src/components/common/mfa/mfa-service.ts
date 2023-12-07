import { MfaServiceInterface } from "./types";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  NOTIFICATION_TYPE,
} from "../../../app.constants";
import {
  createApiResponse,
  getRequestConfig,
  http,
  Http,
} from "../../../utils/http";
import { ApiResponseResult, DefaultApiResponse } from "../../../types";

export function mfaService(axios: Http = http): MfaServiceInterface {
  const sendMfaCode = async function (
    sessionId: string,
    clientSessionId: string,
    emailAddress: string,
    sourceIp: string,
    persistentSessionId: string,
    notificationType: NOTIFICATION_TYPE,
    userLanguage: string
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.MFA,
      {
        email: emailAddress,
        notificationType,
      },
      getRequestConfig({
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        sourceIp: sourceIp,
        persistentSessionId: persistentSessionId,
        userLanguage: userLanguage,
      })
    );

    return createApiResponse<DefaultApiResponse>(response, [
      HTTP_STATUS_CODES.NO_CONTENT,
    ]);
  };

  return {
    sendMfaCode,
  };
}
