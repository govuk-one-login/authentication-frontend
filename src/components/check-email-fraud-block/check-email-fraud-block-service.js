import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
export function checkEmailFraudBlockService(axios = http) {
    const checkEmailFraudBlock = async function (email, sessionId, clientSessionId, persistentSessionId, req) {
        const response = await axios.client.post(API_ENDPOINTS.CHECK_EMAIL_FRAUD_BLOCK, {
            email: email.toLowerCase(),
        }, getInternalRequestConfigWithSecurityHeaders({
            sessionId: sessionId,
            clientSessionId: clientSessionId,
            persistentSessionId: persistentSessionId,
        }, req, API_ENDPOINTS.CHECK_EMAIL_FRAUD_BLOCK));
        return createApiResponse(response);
    };
    return {
        checkEmailFraudBlock,
    };
}
