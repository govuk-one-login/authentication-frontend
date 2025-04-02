import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
export function createPasswordService(axios = http) {
    const signUpUser = async function (sessionId, clientSessionId, emailAddress, password, persistentSessionId, req) {
        const response = await axios.client.post(API_ENDPOINTS.SIGNUP_USER, {
            email: emailAddress,
            password: password,
        }, getInternalRequestConfigWithSecurityHeaders({
            sessionId: sessionId,
            clientSessionId: clientSessionId,
            persistentSessionId: persistentSessionId,
        }, req, API_ENDPOINTS.SIGNUP_USER));
        return createApiResponse(response);
    };
    return {
        signUpUser,
    };
}
