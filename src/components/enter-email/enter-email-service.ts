import {
  createApiResponse,
  getRequestConfig,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
import { EnterEmailServiceInterface, UserExists } from "./types";
import { ApiResponse } from "../../types";

export function enterEmailService(
  axios: Http = http
): EnterEmailServiceInterface {
  const userExists = async function (
    sessionId: string,
    emailAddress: string,
    sourceIp: string,
    persistentSessionId: string
  ): Promise<UserExists> {
    const response = await axios.client.post<ApiResponse>(
      API_ENDPOINTS.USER_EXISTS,
      {
        email: emailAddress.toLowerCase(),
      },
      getRequestConfig({
        sessionId: sessionId,
        sourceIp: sourceIp,
        persistentSessionId: persistentSessionId,
      })
    );

    const apiResponse = createApiResponse(response) as UserExists;
    apiResponse.email = response.data.email;

    return apiResponse;
  };

  return {
    userExists,
  };
}
