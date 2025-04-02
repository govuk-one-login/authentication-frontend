import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
export function reverificationResultService(axios = http) {
    const getReverificationResult = async function (sessionId, clientSessionId, persistentSessionId, req, email, code, state) {
        const config = getInternalRequestConfigWithSecurityHeaders({
            sessionId: sessionId,
            clientSessionId: clientSessionId,
            persistentSessionId: persistentSessionId,
        }, req, API_ENDPOINTS.REVERIFICATION_RESULT);
        const response = await axios.client.post(API_ENDPOINTS.REVERIFICATION_RESULT, { email, code, state }, config);
        return createApiResponse(response);
    };
    return {
        getReverificationResult,
    };
}
