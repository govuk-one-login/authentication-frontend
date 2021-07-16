import { API_ENDPOINTS } from "../../../app.constants";
import { getBaseRequestConfig, http, Http } from "../../../utils/http";
import { VerifyCode } from "./types";

export function codeService(axios: Http = http): any {
  const verifyCode = async function (
    sessionId: string,
    code: string,
    notificationType: string
  ): Promise<string> {
    const { data } = await axios.client.post<VerifyCode>(
      API_ENDPOINTS.VERIFY_CODE,
      {
        code,
        notificationType,
      },
      getBaseRequestConfig(sessionId)
    );
    return data.sessionState;
  };

  return {
    verifyCode,
  };
}
