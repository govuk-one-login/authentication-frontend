import {
  createApiResponse,
  getRequestConfig,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
import { ApiResponseResult } from "../../types";
import {
  CheckEmailFraudBlockInterface,
  CheckEmailFraudBlockResponse,
} from "./types";

export function checkEmailFraudBlockService(
  axios: Http = http
): CheckEmailFraudBlockInterface {
  const checkEmailFraudBlock = async function (
    email: string,
    sessionId: string,
    sourceIp: string,
    clientSessionId: string,
    persistentSessionId: string
  ): Promise<ApiResponseResult<CheckEmailFraudBlockResponse>> {
    const response = await axios.client.post<CheckEmailFraudBlockResponse>(
      API_ENDPOINTS.CHECK_EMAIL_FRAUD_BLOCK,
      {
        email: email.toLowerCase(),
      },
      getRequestConfig({
        sessionId: sessionId,
        sourceIp: sourceIp,
        clientSessionId: clientSessionId,
        persistentSessionId: persistentSessionId,
      })
    );
    return createApiResponse<CheckEmailFraudBlockResponse>(response);
  };
  return {
    checkEmailFraudBlock,
  };
}
