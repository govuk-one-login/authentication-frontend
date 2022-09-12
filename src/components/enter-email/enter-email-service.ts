import {
  createApiResponse,
  getRequestConfig,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
import { EnterEmailServiceInterface, UserExists } from "./types";
import { ApiResponseResult } from "../../types";

export function enterEmailService(
  axios: Http = http
): EnterEmailServiceInterface {
  const userExists = async function (
    sessionId: string,
    emailAddress: string,
    sourceIp: string,
    clientSessionId: string,
    persistentSessionId: string
  ): Promise<ApiResponseResult<UserExists>> {
    const response = await axios.client.post<UserExists>(
      API_ENDPOINTS.USER_EXISTS,
      {
        email: emailAddress.toLowerCase(),
      },
      getRequestConfig({
        sessionId: sessionId,
        sourceIp: sourceIp,
        clientSessionId: clientSessionId,
        persistentSessionId: persistentSessionId,
      })
    );

    return createApiResponse<UserExists>(response);
  };

  return {
    userExists,
  };
}
