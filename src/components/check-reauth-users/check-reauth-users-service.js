import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../app.constants";
export function checkReauthUsersService(axios = http) {
    const checkReauthUsers = async function (sessionId, emailAddress, sub, clientSessionId, persistentSessionId, req) {
        const lowerCaseEmail = emailAddress.toLowerCase();
        const config = getInternalRequestConfigWithSecurityHeaders({
            sessionId,
            validationStatuses: [
                HTTP_STATUS_CODES.OK,
                HTTP_STATUS_CODES.BAD_REQUEST,
                HTTP_STATUS_CODES.NOT_FOUND,
            ],
            clientSessionId,
            persistentSessionId,
        }, req, API_ENDPOINTS.CHECK_REAUTH_USER);
        const response = await axios.client.post(API_ENDPOINTS.CHECK_REAUTH_USER, { email: lowerCaseEmail, rpPairwiseId: sub }, config);
        return createApiResponse(response);
    };
    return {
        checkReauthUsers,
    };
}
