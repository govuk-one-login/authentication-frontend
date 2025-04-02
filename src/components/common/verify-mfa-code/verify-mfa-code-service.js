import { API_ENDPOINTS, HTTP_STATUS_CODES, } from "../../../app.constants";
import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../../utils/http";
export function verifyMfaCodeService(axios = http) {
    const verifyMfaCode = async function (methodType, code, sessionId, clientSessionId, persistentSessionId, req, journeyType, profileInformation) {
        const response = await axios.client.post(API_ENDPOINTS.VERIFY_MFA_CODE, {
            mfaMethodType: methodType,
            code,
            journeyType,
            ...(profileInformation && { profileInformation }),
        }, getInternalRequestConfigWithSecurityHeaders({
            sessionId,
            clientSessionId,
            persistentSessionId: persistentSessionId,
        }, req, API_ENDPOINTS.VERIFY_MFA_CODE));
        return createApiResponse(response, [HTTP_STATUS_CODES.NO_CONTENT]);
    };
    return {
        verifyMfaCode,
    };
}
