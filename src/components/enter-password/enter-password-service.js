import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES, } from "../../app.constants";
export function enterPasswordService(axios = http) {
    const loginUser = async function (sessionId, emailAddress, password, clientSessionId, persistentSessionId, req, journeyType) {
        const payload = {
            email: emailAddress,
            password: password,
        };
        if (journeyType) {
            payload.journeyType = journeyType;
        }
        const response = await axios.client.post(API_ENDPOINTS.LOG_IN_USER, payload, getInternalRequestConfigWithSecurityHeaders({
            sessionId: sessionId,
            clientSessionId: clientSessionId,
            validationStatuses: [
                HTTP_STATUS_CODES.OK,
                HTTP_STATUS_CODES.UNAUTHORIZED,
                HTTP_STATUS_CODES.BAD_REQUEST,
            ],
            persistentSessionId: persistentSessionId,
        }, req, API_ENDPOINTS.LOG_IN_USER));
        return createApiResponse(response);
    };
    return {
        loginUser,
    };
}
