import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
export function accountInterventionService(axios = http) {
    const accountInterventionStatus = async function (sessionId, emailAddress, clientSessionId, persistentSessionId, req, authenticated) {
        const bodyWithEmail = { email: emailAddress.toLowerCase() };
        const body = authenticated !== undefined
            ? { ...bodyWithEmail, authenticated: authenticated }
            : bodyWithEmail;
        const response = await axios.client.post(API_ENDPOINTS.ACCOUNT_INTERVENTIONS, body, getInternalRequestConfigWithSecurityHeaders({
            sessionId: sessionId,
            clientSessionId: clientSessionId,
            persistentSessionId: persistentSessionId,
        }, req, API_ENDPOINTS.ACCOUNT_INTERVENTIONS));
        return createApiResponse(response);
    };
    return {
        accountInterventionStatus,
    };
}
