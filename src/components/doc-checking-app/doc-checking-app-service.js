import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
export function docCheckingAppService(axios = http) {
    const docCheckingAuthorize = async function (sessionId, clientSessionId, persistentSessionId, req) {
        const response = await axios.client.post(API_ENDPOINTS.DOC_CHECKING_APP_AUTHORIZE, {}, getInternalRequestConfigWithSecurityHeaders({
            sessionId: sessionId,
            clientSessionId: clientSessionId,
            persistentSessionId: persistentSessionId,
        }, req, API_ENDPOINTS.DOC_CHECKING_APP_AUTHORIZE));
        return createApiResponse(response);
    };
    return {
        docCheckingAppAuthorize: docCheckingAuthorize,
    };
}
