import { RequestType, UpdateProfileServiceInterface } from "./types";

import { API_ENDPOINTS } from "../../../app.constants";
import {
  createApiResponse,
  getRequestConfig,
  http,
  Http,
} from "../../../utils/http";
import { ApiResponse, ApiResponseResult } from "../../../types";

export function updateProfileService(
  axios: Http = http
): UpdateProfileServiceInterface {
  const updateProfile = async function (
    sessionId: string,
    clientSessionId: string,
    email: string,
    requestType: RequestType,
    sourceIp: string
  ): Promise<ApiResponseResult> {
    const response = await axios.client.post<ApiResponse>(
      API_ENDPOINTS.UPDATE_PROFILE,
      {
        email,
        profileInformation: requestType.profileInformation,
        updateProfileType: requestType.updateProfileType,
      },
      getRequestConfig({ sessionId, clientSessionId, sourceIp })
    );

    return createApiResponse(response);
  };

  return {
    updateProfile,
  };
}
