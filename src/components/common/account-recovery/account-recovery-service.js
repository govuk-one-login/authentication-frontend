import { API_ENDPOINTS } from "../../../app.constants";
import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../../utils/http";
export function accountRecoveryService(axios = http) {
    const accountRecovery = async function (sessionId, clientSessionId, email, persistentSessionId, req) {
        const response = await axios.client.post(API_ENDPOINTS.ACCOUNT_RECOVERY, {
            email,
        }, getInternalRequestConfigWithSecurityHeaders({
            sessionId,
            clientSessionId,
            persistentSessionId,
        }, req, API_ENDPOINTS.ACCOUNT_RECOVERY));
        return createApiResponse(response);
    };
    return {
        accountRecovery,
    };
}
