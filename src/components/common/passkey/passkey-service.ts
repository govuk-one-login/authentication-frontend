import type { Http } from "../../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../../utils/http.js";
import type {
  PasskeyServiceInterface,
  StartPasskeyAssertionResponse,
} from "./types.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants.js";
import type { Request } from "express";
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser";

export function passkeyService(axios: Http = http): PasskeyServiceInterface {
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
          validationStatuses: [
            HTTP_STATUS_CODES.UNAUTHORIZED,
            HTTP_STATUS_CODES.OK,
            HTTP_STATUS_CODES.BAD_REQUEST,
          ],
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
