import { API_ENDPOINTS, HTTP_STATUS_CODES, } from "../../../app.constants";
import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../../utils/http";
export function mfaService(axios = http) {
    const sendMfaCode = async function (sessionId, clientSessionId, emailAddress, persistentSessionId, isResendCodeRequest, userLanguage, req, journeyType) {
        const response = await axios.client.post(API_ENDPOINTS.MFA, {
            email: emailAddress,
            isResendCodeRequest,
            journeyType,
        }, getInternalRequestConfigWithSecurityHeaders({
            sessionId: sessionId,
            clientSessionId: clientSessionId,
            persistentSessionId: persistentSessionId,
            userLanguage: userLanguage,
        }, req, API_ENDPOINTS.MFA));
        return createApiResponse(response, [
            HTTP_STATUS_CODES.NO_CONTENT,
        ]);
    };
    return {
        sendMfaCode,
    };
}
