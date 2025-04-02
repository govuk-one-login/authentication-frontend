import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants";
export function resetPasswordService(axios = http) {
    const updatePassword = async function (newPassword, sessionId, clientSessionId, persistentSessionId, isForcedPasswordReset, allowMfaResetAfterPasswordReset, req) {
        const response = await axios.client.post(API_ENDPOINTS.RESET_PASSWORD, {
            password: newPassword,
            isForcedPasswordReset: isForcedPasswordReset,
            allowMfaResetAfterPasswordReset: allowMfaResetAfterPasswordReset,
        }, getInternalRequestConfigWithSecurityHeaders({
            sessionId: sessionId,
            clientSessionId: clientSessionId,
            persistentSessionId: persistentSessionId,
        }, req, API_ENDPOINTS.RESET_PASSWORD));
        return createApiResponse(response, [
            HTTP_STATUS_CODES.NO_CONTENT,
        ]);
    };
    return {
        updatePassword,
    };
}
