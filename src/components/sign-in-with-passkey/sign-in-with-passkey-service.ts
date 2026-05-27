import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import type {
  FinishSignInWithPasskeyInterface,
  StartSignInWithPasskeyInterface,
  StartSignInWithPasskeyResponse,
} from "./types.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import { API_ENDPOINTS } from "../../app.constants.js";
import type { Request } from "express";
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser";

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

export function finishSignInWithPasskeyService(
  axios: Http = http
): FinishSignInWithPasskeyInterface {
  const finishSignInWithPasskey = async function (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    authenticationResponse: AuthenticationResponseJSON
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.FINISH_PASSKEY_ASSERTION,
      { pkc: authenticationResponse },
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
          clientSessionId: clientSessionId,
          persistentSessionId: persistentSessionId,
        },
        req,
        API_ENDPOINTS.FINISH_PASSKEY_ASSERTION
      )
    );

    return createApiResponse<DefaultApiResponse>(response);
  };

  return {
    finishSignInWithPasskey,
  };
}
