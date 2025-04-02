import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants";
import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../../utils/http";
export function updateProfileService(axios = http) {
    const updateProfile = async function (sessionId, clientSessionId, email, requestType, persistentSessionId, req) {
        const response = await axios.client.post(API_ENDPOINTS.UPDATE_PROFILE, {
            email,
            profileInformation: requestType.profileInformation,
            updateProfileType: requestType.updateProfileType,
        }, getInternalRequestConfigWithSecurityHeaders({
            sessionId,
            clientSessionId,
            persistentSessionId,
        }, req, API_ENDPOINTS.UPDATE_PROFILE));
        return createApiResponse(response, [
            HTTP_STATUS_CODES.NO_CONTENT,
        ]);
    };
    return {
        updateProfile,
    };
}
