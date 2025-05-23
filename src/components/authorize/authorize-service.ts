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
  if (startRequestParameters.cookie_consent !== undefined)
    body["cookie_consent"] = startRequestParameters.cookie_consent;
  if (startRequestParameters._ga !== undefined)
    body["_ga"] = startRequestParameters._ga;
  body["requested_credential_strength"] =
    startRequestParameters.requested_credential_strength;
  if (startRequestParameters.requested_level_of_confidence !== undefined)
    body["requested_level_of_confidence"] =
      startRequestParameters.requested_level_of_confidence;
  body["client_id"] = startRequestParameters.rp_client_id;
  body["scope"] = startRequestParameters.scope;
  body["redirect_uri"] = startRequestParameters.rp_redirect_uri;
  body["state"] = startRequestParameters.rp_state;
  body["client_name"] = startRequestParameters.client_name;
  return body;
}
