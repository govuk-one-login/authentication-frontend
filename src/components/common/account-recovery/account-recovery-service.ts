import { API_ENDPOINTS } from "../../../app.constants";
import {
  createApiResponse,
  getRequestConfig,
  http,
  Http,
} from "../../../utils/http";
import { ApiResponseResult, DefaultApiResponse } from "../../../types";
import { AccountRecoveryInterface, AccountRecoveryResponse } from "./types";

export function accountRecoveryService(
  axios: Http = http
): AccountRecoveryInterface {
  const accountRecovery = async function (
    sessionId: string,
    clientSessionId: string,
    email: string,
    sourceIp: string,
    persistentSessionId: string
  ): Promise<ApiResponseResult<AccountRecoveryResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.ACCOUNT_RECOVERY,
      {
        email,
      },
      getRequestConfig({
        sessionId,
        clientSessionId,
        sourceIp: sourceIp,
        persistentSessionId: persistentSessionId,
      })
    );

    return createApiResponse<AccountRecoveryResponse>(response);
  };

  return {
    accountRecovery,
  };
}
