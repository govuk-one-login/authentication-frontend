import { AuthorizeServiceInterface, StartAuthResponse } from "./types";
import { ApiResponseResult } from "../../types";
import { API_ENDPOINTS } from "../../app.constants";
import {
  createApiResponse,
  getRequestConfig,
  http,
  Http,
} from "../../utils/http";
import { supportReauthentication } from "../../config";

export function authorizeService(
  axios: Http = http
): AuthorizeServiceInterface {
  const start = async function (
    sessionId: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string,
    reauthenticate?: string
  ): Promise<ApiResponseResult<StartAuthResponse>> {
    let reauthenticateOption = undefined;
    if (supportReauthentication() && reauthenticate) {
      reauthenticateOption = reauthenticate !== "";
    }
    const response = await axios.client.get<StartAuthResponse>(
      API_ENDPOINTS.START,
      getRequestConfig({
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        sourceIp: sourceIp,
        persistentSessionId: persistentSessionId,
        reauthenticate: reauthenticateOption,
      })
    );

    return createApiResponse<StartAuthResponse>(response);
  };

  return {
    start,
  };
}
