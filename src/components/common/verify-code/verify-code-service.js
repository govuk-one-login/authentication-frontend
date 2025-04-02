import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants";
import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../../utils/http";
export function codeService(axios = http) {
    const verifyCode = async function (sessionId, code, notificationType, clientSessionId, persistentSessionId, req, journeyType) {
        const response = await axios.client.post(API_ENDPOINTS.VERIFY_CODE, {
            code,
            notificationType,
            journeyType,
        }, getInternalRequestConfigWithSecurityHeaders({
            sessionId,
            clientSessionId,
            persistentSessionId: persistentSessionId,
        }, req, API_ENDPOINTS.VERIFY_CODE));
        return createApiResponse(response, [HTTP_STATUS_CODES.NO_CONTENT]);
    };
    return {
        verifyCode,
    };
}
