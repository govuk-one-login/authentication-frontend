import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import type {
  SignInWithPasskeyInterface,
  StartPasskeyAssertionResponse,
} from "./types.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import { API_ENDPOINTS } from "../../app.constants.js";
import type { Request } from "express";
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser";

export function signInWithPasskeyService(
  axios: Http = http
): SignInWithPasskeyInterface {
  const startPasskeyAssertion = async function (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ): Promise<ApiResponseResult<StartPasskeyAssertionResponse>> {
    const response = await axios.client.post<StartPasskeyAssertionResponse>(
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

    return createApiResponse<StartPasskeyAssertionResponse>(response);
  };

  const finishPasskeyAssertion = async function (
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
    startPasskeyAssertion: startPasskeyAssertion,
    finishPasskeyAssertion: finishPasskeyAssertion,
  };
}
