import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  Http,
  http,
} from "../../utils/http.js";
import { API_ENDPOINTS } from "../../app.constants.js";
import {
  DocCheckingAuthorisationResponse,
  DocCheckingAppInterface,
} from "./types.js";
import { ApiResponseResult } from "../../types.js";
import { Request } from "express";

export function docCheckingAppService(
  axios: Http = http
): DocCheckingAppInterface {
  const docCheckingAuthorize = async function (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ): Promise<ApiResponseResult<DocCheckingAuthorisationResponse>> {
    const response = await axios.client.post<DocCheckingAuthorisationResponse>(
      API_ENDPOINTS.DOC_CHECKING_APP_AUTHORIZE,
      {},
      getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
          clientSessionId: clientSessionId,
          persistentSessionId: persistentSessionId,
        },
        req,
        API_ENDPOINTS.DOC_CHECKING_APP_AUTHORIZE
      )
    );
    return createApiResponse<DocCheckingAuthorisationResponse>(response);
  };

  return {
    docCheckingAppAuthorize: docCheckingAuthorize,
  };
}
