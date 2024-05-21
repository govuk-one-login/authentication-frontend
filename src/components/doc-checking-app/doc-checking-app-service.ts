import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
import {
  DocCheckingAuthorisationResponse,
  DocCheckingAppInterface,
} from "./types";
import { ApiResponseResult } from "../../types";
import { Request } from "express";

export function docCheckingAppService(
  axios: Http = http
): DocCheckingAppInterface {
  const docCheckingAuthorize = async function (
    sessionId: string,
    clientSessionId: string,
    sourceIp: string,
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
          sourceIp: sourceIp,
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
