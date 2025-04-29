import type {
  CrossBrowserInterface,
  CrossBrowserRequest,
  IDReverificationStateResponse,
} from "./types.js";
import type { Request } from "express";
import { API_ENDPOINTS } from "../../app.constants.js";
import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import { BadRequestError } from "../../utils/error.js";
export class CrossBrowserService implements CrossBrowserInterface {
  constructor(private readonly axios: Http = http) {}
  isCrossBrowserIssue(req: Request): req is CrossBrowserRequest {
    return !!(
      req.query.error === "access_denied" &&
      req.query.state &&
      typeof req.query.state === "string"
    );
  }

  async getOrchestrationRedirectUrl(req: CrossBrowserRequest): Promise<string> {
    const orchestrationRedirectUrl = await this.getBaseOrchestrationRedirectUrl(
      req,
      req.query.state
    );
    orchestrationRedirectUrl.searchParams.set("error", "access_denied");
    orchestrationRedirectUrl.searchParams.set(
      "error_description",
      "no_session"
    );
    return orchestrationRedirectUrl.toString();
  }

  private async getBaseOrchestrationRedirectUrl(
    req: Request,
    authenticationState: string
  ): Promise<URL> {
    const config = getInternalRequestConfigWithSecurityHeaders(
      {},
      req,
      API_ENDPOINTS.ID_REVERIFICATION_STATE
    );
    const response =
      await this.axios.client.post<IDReverificationStateResponse>(
        API_ENDPOINTS.ID_REVERIFICATION_STATE,
        {
          authenticationState,
        },
        config
      );

    const apiResponse =
      createApiResponse<IDReverificationStateResponse>(response);
    if (!apiResponse.success) {
      throw new BadRequestError(
        `ID Reverification State request failed. Message: ${response.data}, code: ${response.status}`
      );
    }

    return new URL(apiResponse.data.orchestrationRedirectUrl);
  }
}
