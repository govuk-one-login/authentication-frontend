import { RequestType, UpdateProfileServiceInterface } from "./types.js";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
  Http,
} from "../../../utils/http.js";
import { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import { Request } from "express";

export function updateProfileService(
  axios: Http = http
): UpdateProfileServiceInterface {
  const updateProfile = async function (
    sessionId: string,
    clientSessionId: string,
    email: string,
    requestType: RequestType,
    persistentSessionId: string,
    req: Request
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.UPDATE_PROFILE,
      {
        email,
        profileInformation: requestType.profileInformation,
        updateProfileType: requestType.updateProfileType,
      },
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId,
          clientSessionId,
          persistentSessionId,
        },
        req,
        API_ENDPOINTS.UPDATE_PROFILE
      )
    );

    return createApiResponse<DefaultApiResponse>(response, [
      HTTP_STATUS_CODES.NO_CONTENT,
    ]);
  };

  return {
    updateProfile,
  };
}
