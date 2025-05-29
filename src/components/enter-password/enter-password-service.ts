import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import type { JOURNEY_TYPE } from "../../app.constants.js";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants.js";
import type { EnterPasswordServiceInterface, UserLoginResponse } from "./types.js";
import type { ApiResponseResult } from "../../types.js";
import type { Request } from "express";

export function enterPasswordService(axios: Http = http): EnterPasswordServiceInterface {
  const loginUser = async function (
    sessionId: string,
    emailAddress: string,
    password: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    journeyType?: JOURNEY_TYPE
  ): Promise<ApiResponseResult<UserLoginResponse>> {
    const payload: {
      email: string;
      password: string;
      journeyType?: JOURNEY_TYPE;
    } = {
      email: emailAddress,
      password: password,
    };

    if (journeyType) {
      payload.journeyType = journeyType;
    }

    const response = await axios.client.post<UserLoginResponse>(
      API_ENDPOINTS.LOG_IN_USER,
      payload,
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
          clientSessionId: clientSessionId,
          validationStatuses: [
            HTTP_STATUS_CODES.OK,
            HTTP_STATUS_CODES.UNAUTHORIZED,
            HTTP_STATUS_CODES.BAD_REQUEST,
          ],
          persistentSessionId: persistentSessionId,
        },
        req,
        API_ENDPOINTS.LOG_IN_USER
      )
    );

    return createApiResponse<UserLoginResponse>(response);
  };

  return {
    loginUser,
  };
}
