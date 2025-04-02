import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
export function enterEmailService(axios = http) {
    const userExists = async function (sessionId, emailAddress, clientSessionId, persistentSessionId, req) {
        const response = await axios.client.post(API_ENDPOINTS.USER_EXISTS, {
            email: emailAddress.toLowerCase(),
        }, getInternalRequestConfigWithSecurityHeaders({
            sessionId: sessionId,
            clientSessionId: clientSessionId,
            persistentSessionId: persistentSessionId,
        }, req, API_ENDPOINTS.USER_EXISTS));
        return createApiResponse(response);
    };
    return {
        userExists,
    };
}
