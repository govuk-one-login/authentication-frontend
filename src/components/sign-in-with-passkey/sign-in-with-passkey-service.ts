import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import type {
  StartSignInWithPasskeyInterface,
  StartSignInWithPasskeyResponse,
} from "./types.js";
import type { ApiResponseResult } from "../../types.js";
import { API_ENDPOINTS } from "../../app.constants.js";
import type { Request } from "express";

export function startSignInWithPasskeyService(
  axios: Http = http
): StartSignInWithPasskeyInterface {
  const startSignInWithPasskey = async function (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ): Promise<ApiResponseResult<StartSignInWithPasskeyResponse>> {
    const response = await axios.client.post<StartSignInWithPasskeyResponse>(
      API_ENDPOINTS.START_PASSKEY_ASSERTION,
      {},
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
          clientSessionId: clientSessionId,
          persistentSessionId: persistentSessionId,
        },
        req,
        API_ENDPOINTS.START_PASSKEY_ASSERTION
      )
    );

    return createApiResponse<StartSignInWithPasskeyResponse>(response);
  };

  return {
    startSignInWithPasskey,
  };
}
