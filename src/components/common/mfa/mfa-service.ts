import { MfaServiceInterface, UserSessionState } from "./types";
import { API_ENDPOINTS } from "../../../app.constants";
import { getBaseRequestConfig, http, Http } from "../../../utils/http";

export function mfaService(axios: Http = http): MfaServiceInterface {
  const sendMfaCode = async function (
    sessionId: string,
    emailAddress: string
  ): Promise<void> {
    await axios.client.post<UserSessionState>(
      API_ENDPOINTS.MFA,
      {
        email: emailAddress,
      },
      getBaseRequestConfig(sessionId)
    );
  };

  return {
    sendMfaCode,
  };
}
