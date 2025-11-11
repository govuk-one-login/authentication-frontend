import type { RequestType, UpdateProfileServiceInterface } from "./types.js";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants.js";
import type { Http } from "../../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../../utils/http.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import type { Request, Response } from "express";

export function updateProfileService(
  axios: Http = http
): UpdateProfileServiceInterface {
  const updateProfile = async function (
    email: string,
    requestType: RequestType,
    req: Request,
    res: Response
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.UPDATE_PROFILE,
      {
        email,
        profileInformation: requestType.profileInformation,
        updateProfileType: requestType.updateProfileType,
      },
      getInternalRequestConfigWithSecurityHeaders(
        req,
        res,
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
