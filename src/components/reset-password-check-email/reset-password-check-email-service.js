import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants";
export function resetPasswordCheckEmailService(axios = http) {
    const resetPasswordRequest = async function (email, sessionId, clientSessionId, persistentSessionId, withinForcedPasswordResetJourney, req) {
        const response = await axios.client.post(API_ENDPOINTS.RESET_PASSWORD_REQUEST, {
            withinForcedPasswordResetJourney: withinForcedPasswordResetJourney,
            email: email,
        }, getInternalRequestConfigWithSecurityHeaders({
            sessionId: sessionId,
            clientSessionId: clientSessionId,
            persistentSessionId: persistentSessionId,
        }, req, API_ENDPOINTS.RESET_PASSWORD_REQUEST));
        return createApiResponse(response, [
            HTTP_STATUS_CODES.OK,
            HTTP_STATUS_CODES.NO_CONTENT,
        ]);
    };
    return {
        resetPasswordRequest,
    };
}
