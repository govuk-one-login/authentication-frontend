import {
  createApiResponse,
  getRequestConfig,
  Http,
  http,
} from "../../utils/http";
import { API_ENDPOINTS } from "../../app.constants";
import {
  DocCheckingAuthorisationResponse,
  DocCheckingAppInterface,
} from "./types";
import { ApiResponseResult } from "../../types";

export function docCheckingAppService(
  axios: Http = http
): DocCheckingAppInterface {
  const docCheckingAuthorize = async function (
    sessionId: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string
  ): Promise<ApiResponseResult<DocCheckingAuthorisationResponse>> {
    const response = await axios.client.post<DocCheckingAuthorisationResponse>(
      API_ENDPOINTS.DOC_CHECKING_APP_AUTHORIZE,
      {},
      getRequestConfig({
        sessionId: sessionId,
        clientSessionId: clientSessionId,
        sourceIp: sourceIp,
        persistentSessionId: persistentSessionId,
      })
    );
    return createApiResponse<DocCheckingAuthorisationResponse>(response);
  };

  return {
    docCheckingAppAuthorize: docCheckingAuthorize,
  };
}
