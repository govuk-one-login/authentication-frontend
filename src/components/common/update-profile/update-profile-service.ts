import type { RequestType, UpdateProfileServiceInterface } from "./types.js";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants.js";
import type { Http } from "../../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../../utils/http.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import type { Request } from "express";

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
