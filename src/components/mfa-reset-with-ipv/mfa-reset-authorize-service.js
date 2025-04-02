import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
export function mfaResetAuthorizeService(axios = http) {
    const ipvRedirectUrl = async function (sessionId, clientSessionId, persistentSessionId, req, email, orchestrationRedirectUrl) {
        const config = getInternalRequestConfigWithSecurityHeaders({
            sessionId: sessionId,
            clientSessionId: clientSessionId,
            persistentSessionId: persistentSessionId,
        }, req, API_ENDPOINTS.MFA_RESET_AUTHORIZE);
        const response = await axios.client.post(API_ENDPOINTS.MFA_RESET_AUTHORIZE, {
            email,
            orchestrationRedirectUrl,
        }, config);
        return createApiResponse(response);
    };
    return {
        ipvRedirectUrl: ipvRedirectUrl,
    };
}
