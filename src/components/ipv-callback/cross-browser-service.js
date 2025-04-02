import { API_ENDPOINTS } from "../../app.constants";
import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../utils/http";
import { BadRequestError } from "../../utils/error";
export class CrossBrowserService {
    axios;
    constructor(axios = http) {
        this.axios = axios;
    }
    isCrossBrowserIssue(req) {
        return !!(req.query.error === "access_denied" &&
            req.query.state &&
            typeof req.query.state === "string");
    }
    async getOrchestrationRedirectUrl(req) {
        const orchestrationRedirectUrl = await this.getBaseOrchestrationRedirectUrl(req, req.query.state);
        orchestrationRedirectUrl.searchParams.set("error", "access_denied");
        orchestrationRedirectUrl.searchParams.set("error_description", "no_session");
        return orchestrationRedirectUrl.toString();
    }
    async getBaseOrchestrationRedirectUrl(req, authenticationState) {
        const config = getInternalRequestConfigWithSecurityHeaders({}, req, API_ENDPOINTS.ID_REVERIFICATION_STATE);
        const response = await this.axios.client.post(API_ENDPOINTS.ID_REVERIFICATION_STATE, {
            authenticationState,
        }, config);
        const apiResponse = createApiResponse(response);
        if (!apiResponse.success) {
            throw new BadRequestError(`ID Reverification State request failed. Message: ${response.data}, code: ${response.status}`);
        }
        return new URL(apiResponse.data.orchestrationRedirectUrl);
    }
}
