import type {
  AuthorizeServiceInterface,
  StartAuthResponse,
  StartRequestParameters,
} from "./types.js";
import type { ApiResponseResult } from "../../types.js";
import { API_ENDPOINTS } from "../../app.constants.js";
import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import { supportReauthentication } from "../../config.js";
import type { Request } from "express";

export function authorizeService(
  axios: Http = http
): AuthorizeServiceInterface {
  const start = async function (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    startRequestParameters: StartRequestParameters
  ): Promise<ApiResponseResult<StartAuthResponse>> {
    let reauthenticateOption = undefined;
    if (supportReauthentication() && startRequestParameters.reauthenticate) {
      reauthenticateOption = startRequestParameters.reauthenticate !== "";
    }
    const response = await axios.client.post<StartAuthResponse>(
      API_ENDPOINTS.START,
      createStartBody(startRequestParameters),
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
          clientSessionId: clientSessionId,
          persistentSessionId: persistentSessionId,
          reauthenticate: reauthenticateOption,
        },
        req,
        API_ENDPOINTS.START
      )
    );

    return createApiResponse<StartAuthResponse>(response);
  };

  return {
    start,
  };
}

function createStartBody(startRequestParameters: StartRequestParameters) {
  const body: { [key: string]: any } = {};

  body["authenticated"] = startRequestParameters.authenticated;

  if (startRequestParameters.current_credential_strength !== undefined)
    body["current-credential-strength"] =
      startRequestParameters.current_credential_strength;
  if (startRequestParameters.previous_session_id !== undefined)
    body["previous-session-id"] = startRequestParameters.previous_session_id;
  if (
    startRequestParameters.reauthenticate !== undefined &&
    supportReauthentication()
  )
    body["rp-pairwise-id-for-reauth"] = startRequestParameters.reauthenticate;
  if (
    startRequestParameters.previous_govuk_signin_journey_id !== undefined &&
    supportReauthentication()
  )
    body["previous-govuk-signin-journey-id"] =
      startRequestParameters.previous_govuk_signin_journey_id;
  return body;
}
