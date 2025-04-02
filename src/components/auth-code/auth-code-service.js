import { API_ENDPOINTS } from "../../app.constants";
import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../utils/http";
import { supportReauthentication } from "../../config";
export function authCodeService(axios = http) {
    const getAuthCode = async function (sessionId, clientSessionId, persistentSessionId, clientSession, userSession, req) {
        const path = API_ENDPOINTS.ORCH_AUTH_CODE;
        const config = getInternalRequestConfigWithSecurityHeaders({
            sessionId: sessionId,
            clientSessionId: clientSessionId,
            persistentSessionId: persistentSessionId,
        }, req, path);
        let body = {
            claims: clientSession.claim,
            state: clientSession.state,
            "redirect-uri": clientSession.redirectUri,
            "rp-sector-uri": clientSession.rpSectorHost,
            "is-new-account": userSession?.isAccountCreationJourney ?? false,
            "password-reset-time": userSession?.passwordResetTime,
        };
        if (supportReauthentication() && userSession.reauthenticate) {
            body = { ...body, "is-reauth-journey": true };
        }
        const response = await axios.client.post(path, body, config);
        return createApiResponse(response);
    };
    return {
        getAuthCode,
    };
}
