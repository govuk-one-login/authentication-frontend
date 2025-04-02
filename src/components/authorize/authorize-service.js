import { API_ENDPOINTS } from "../../app.constants";
import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../utils/http";
import { supportReauthentication } from "../../config";
export function authorizeService(axios = http) {
    const start = async function (sessionId, clientSessionId, persistentSessionId, req, startRequestParameters) {
        let reauthenticateOption = undefined;
        if (supportReauthentication() && startRequestParameters.reauthenticate) {
            reauthenticateOption = startRequestParameters.reauthenticate !== "";
        }
        const response = await axios.client.post(API_ENDPOINTS.START, createStartBody(startRequestParameters), getInternalRequestConfigWithSecurityHeaders({
            sessionId: sessionId,
            clientSessionId: clientSessionId,
            persistentSessionId: persistentSessionId,
            reauthenticate: reauthenticateOption,
        }, req, API_ENDPOINTS.START));
        return createApiResponse(response);
    };
    return {
        start,
    };
}
function createStartBody(startRequestParameters) {
    const body = {};
    body["authenticated"] = startRequestParameters.authenticated;
    if (startRequestParameters.current_credential_strength !== undefined)
        body["current-credential-strength"] =
            startRequestParameters.current_credential_strength;
    if (startRequestParameters.previous_session_id !== undefined)
        body["previous-session-id"] = startRequestParameters.previous_session_id;
    if (startRequestParameters.reauthenticate !== undefined &&
        supportReauthentication())
        body["rp-pairwise-id-for-reauth"] = startRequestParameters.reauthenticate;
    if (startRequestParameters.previous_govuk_signin_journey_id !== undefined &&
        supportReauthentication())
        body["previous-govuk-signin-journey-id"] =
            startRequestParameters.previous_govuk_signin_journey_id;
    return body;
}
