import {
  createApiResponse,
  getRequestConfig,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
import { CheckReauthServiceInterface } from "./types";
import { ApiResponseResult, DefaultApiResponse } from "../../types";

export function checkReauthUsersService(
  axios: Http = http
): CheckReauthServiceInterface {
  const checkReauthUsers = async function (
    sessionId: string,
    emailAddress: string,
    sourceIp: string,
    clientSessionId: string,
    persistentSessionId: string
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const lowerCaseEmail = emailAddress.toLowerCase();
    const config = getRequestConfig({
      sessionId,
      sourceIp,
      clientSessionId,
      persistentSessionId,
    });

    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.CHECK_REAUTH_USERS,
      { email: lowerCaseEmail },
      config
    );

    return createApiResponse<DefaultApiResponse>(response);
  };

  return {
    checkReauthUsers,
  };
}
