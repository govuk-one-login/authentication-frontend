import { RequestType, UpdateProfileServiceInterface } from "./types";

import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants";
import {
  createApiResponse,
  getRequestConfig,
  http,
  Http,
} from "../../../utils/http";
import { ApiResponseResult, DefaultApiResponse } from "../../../types";

export function updateProfileService(
  axios: Http = http
): UpdateProfileServiceInterface {
  const updateProfile = async function (
    sessionId: string,
    clientSessionId: string,
    email: string,
    requestType: RequestType,
    sourceIp: string,
    persistentSessionId: string
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.UPDATE_PROFILE,
      {
        email,
        profileInformation: requestType.profileInformation,
        updateProfileType: requestType.updateProfileType,
      },
      getRequestConfig({
        sessionId,
        clientSessionId,
        sourceIp,
        persistentSessionId,
      })
    );

    return createApiResponse<DefaultApiResponse>(response, [
      HTTP_STATUS_CODES.NO_CONTENT,
    ]);
  };

  return {
    updateProfile,
  };
}
